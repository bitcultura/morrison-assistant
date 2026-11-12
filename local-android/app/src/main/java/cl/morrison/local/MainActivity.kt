package cl.morrison.local

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.media.AudioManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.provider.OpenableColumns
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.util.Base64
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import androidx.webkit.WebViewAssetLoader
import dev.ffmpegkit.llama.Llama
import dev.ffmpegkit.llama.LlamaConfig
import dev.ffmpegkit.llama.LlamaModel
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.security.KeyStore
import java.security.SecureRandom
import java.util.Locale
import java.util.concurrent.atomic.AtomicBoolean
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKeyFactory
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties

class MainActivity : Activity(), TextToSpeech.OnInitListener {
    private lateinit var web: WebView
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val mainHandler = Handler(Looper.getMainLooper())
    private var tts: TextToSpeech? = null
    private var recognizer: SpeechRecognizer? = null
    private var model: LlamaModel? = null
    private val modelBusy = AtomicBoolean(false)
    private val activityFileChooseModel = 1001
    private val activityFileExport = 1002
    private val activityFileImport = 1003
    private val requestRecordAudio = 2001
    private var exportPending: Pair<String,String>? = null
    private var importPassword: String? = null
    private val modelFile by lazy { File(filesDir, "morrison-model.gguf") }
    private val prefs by lazy { getSharedPreferences("morrison-local-secure", MODE_PRIVATE) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = android.graphics.Color.rgb(4, 13, 24)
        window.navigationBarColor = android.graphics.Color.rgb(4, 13, 24)
        web = WebView(this)
        setContentView(web)
        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()
        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = false  // Estado privado cifrado en Android Keystore.
        web.settings.allowFileAccess = false
        web.settings.allowContentAccess = false
        web.settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
        web.settings.mediaPlaybackRequiresUserGesture = true
        web.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView?, request: WebResourceRequest?): WebResourceResponse? {
                return request?.url?.let { assetLoader.shouldInterceptRequest(it) }
            }
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val uri = request?.url ?: return true
                return !(uri.scheme == "https" && uri.host == "appassets.androidplatform.net" && uri.path?.startsWith("/assets/") == true)
            }
        }
        web.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: android.webkit.ConsoleMessage?): Boolean {
                // Evitar logs de mensajes del usuario o datos privados.
                return true
            }
        }
        web.addJavascriptInterface(DeviceBridge(), "MorrisonNative")
        web.loadUrl("https://appassets.androidplatform.net/assets/index.html")
        tts = TextToSpeech(this, this)
        audioManager()
    }

    private fun audioManager() {
        // El audio se reproduce por la salida habitual del dispositivo.
        volumeControlStream = AudioManager.STREAM_MUSIC
    }

    private fun event(type: String, data: String) {
        mainHandler.post {
            if (!isFinishing && ::web.isInitialized) {
                web.evaluateJavascript(
                    "window.mrrNativeEvent && window.mrrNativeEvent(${JSONObject.quote(type)},${JSONObject.quote(data)})",
                    null
                )
            }
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts?.language = Locale("es", "CL")
            event("ttsReady", availableVoices())
        } else event("ttsStatus", "No hay motor de voz instalado; instala voces de español sin conexión en Android.")
    }

    private fun availableVoices(): String {
        val values = JSONArray()
        tts?.voices?.filter { it.locale.language == "es" && !it.isNetworkConnectionRequired }
            ?.sortedBy { it.name }?.forEach { v ->
                values.put(JSONObject().put("name", v.name).put("locale", v.locale.toLanguageTag()))
            }
        return values.toString()
    }

    private fun beginSpeech() {
        if (Build.VERSION.SDK_INT < 31 || !SpeechRecognizer.isOnDeviceRecognitionAvailable(this)) {
            event("speechError", "Android no tiene reconocimiento de voz local disponible. Puedes escribir o instalar el paquete de español sin conexión desde Ajustes del teléfono.")
            return
        }
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(arrayOf(Manifest.permission.RECORD_AUDIO), requestRecordAudio)
            return
        }
        recognizer?.destroy()
        recognizer = SpeechRecognizer.createOnDeviceSpeechRecognizer(this)
        recognizer?.setRecognitionListener(object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) { event("speechStatus", "Escuchando en el dispositivo…") }
            override fun onBeginningOfSpeech() {}
            override fun onRmsChanged(rmsdB: Float) {}
            override fun onBufferReceived(buffer: ByteArray?) {}
            override fun onEndOfSpeech() { event("speechStatus", "Procesando voz local…") }
            override fun onError(error: Int) {
                event("speechError", "No se pudo reconocer la voz local (código $error). Prueba de nuevo o escribe el mensaje.")
            }
            override fun onResults(results: Bundle?) {
                val text = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull().orEmpty()
                if (text.isNotBlank()) event("speechResult", text)
                else event("speechError", "No se reconoció ninguna frase.")
            }
            override fun onPartialResults(partialResults: Bundle?) {}
            override fun onEvent(eventType: Int, params: Bundle?) {}
        })
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
            .putExtra(RecognizerIntent.EXTRA_LANGUAGE, "es-CL")
            .putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            .putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false)
            .putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true)
        recognizer?.startListening(intent)
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == requestRecordAudio) {
            if (grantResults.firstOrNull() == PackageManager.PERMISSION_GRANTED) beginSpeech()
            else event("speechError", "Permiso del micrófono denegado. Se puede usar el teclado.")
        }
    }

    private fun getKey(): SecretKey {
        val ks = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        (ks.getKey("morrison-keystore-v3", null) as? SecretKey)?.let { return it }
        val gen = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
        val spec = KeyGenParameterSpec.Builder(
            "morrison-keystore-v3", KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
        ).setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setKeySize(256).build()
        gen.init(spec)
        return gen.generateKey()
    }

    @Synchronized
    private fun saveEncryptedState(text: String) {
        if (text.length > 2_000_000) throw IllegalArgumentException("Estado demasiado grande")
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, getKey())
        val encrypted = cipher.doFinal(text.toByteArray(Charsets.UTF_8))
        prefs.edit().putString("state", "${Base64.encodeToString(cipher.iv, Base64.NO_WRAP)}:${Base64.encodeToString(encrypted, Base64.NO_WRAP)}").apply()
    }

    @Synchronized
    private fun loadEncryptedState(): String {
        val saved = prefs.getString("state", null) ?: return ""
        val chunks = saved.split(':')
        if (chunks.size != 2) return ""
        return try {
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.DECRYPT_MODE, getKey(), GCMParameterSpec(128, Base64.decode(chunks[0], Base64.NO_WRAP)))
            String(cipher.doFinal(Base64.decode(chunks[1], Base64.NO_WRAP)), Charsets.UTF_8)
        } catch (e: Exception) {
            // No borrar los datos cifrados ante un problema de descifrado.
            event("storageError", "No se pudo abrir el almacenamiento protegido. Los datos cifrados originales se conservan.")
            ""
        }
    }

    private fun makeBackup(data: String, passphrase: String): ByteArray {
        if (passphrase.length < 12) throw IllegalArgumentException("Usa una frase de 12 caracteres o más")
        val salt = ByteArray(16).also { SecureRandom().nextBytes(it) }
        val keySpec = PBEKeySpec(passphrase.toCharArray(), salt, 250_000, 256)
        val key = SecretKeySpec(SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(keySpec).encoded, "AES")
        keySpec.clearPassword()
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, key)
        val encrypted = cipher.doFinal(data.toByteArray(Charsets.UTF_8))
        return JSONObject()
            .put("kind", "MORRISON_LOCAL_ENCRYPTED_BACKUP")
            .put("version", 1)
            .put("iterations", 250000)
            .put("salt", Base64.encodeToString(salt, Base64.NO_WRAP))
            .put("iv", Base64.encodeToString(cipher.iv, Base64.NO_WRAP))
            .put("data", Base64.encodeToString(encrypted, Base64.NO_WRAP))
            .toString(2).toByteArray(Charsets.UTF_8)
    }

    private fun decodeBackup(file: ByteArray, passphrase: String): String {
        if (file.size > 8_000_000) throw IllegalArgumentException("Archivo de respaldo demasiado grande")
        val raw = String(file, Charsets.UTF_8)
        val outer = JSONObject(raw)
        if (outer.optString("kind") != "MORRISON_LOCAL_ENCRYPTED_BACKUP") {
            // Permitir únicamente exportaciones JSON explícitas de MORRISON anterior, con confirmación en la interfaz.
            if (!outer.has("projects") || !outer.has("tasks") || !outer.has("notes")) throw IllegalArgumentException("Formato de respaldo incompatible")
            return raw
        }
        if (passphrase.length < 12) throw IllegalArgumentException("Introduce la frase de cifrado original")
        if (outer.optInt("version") != 1 || outer.optInt("iterations") != 250000) throw IllegalArgumentException("Versión de respaldo no compatible")
        val salt = Base64.decode(outer.getString("salt"), Base64.NO_WRAP)
        val iv = Base64.decode(outer.getString("iv"), Base64.NO_WRAP)
        val encrypted = Base64.decode(outer.getString("data"), Base64.NO_WRAP)
        if (salt.size != 16 || iv.size != 12) throw IllegalArgumentException("Parámetros de respaldo inválidos")
        val pbe = PBEKeySpec(passphrase.toCharArray(), salt, 250_000, 256)
        val key = SecretKeySpec(SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(pbe).encoded, "AES")
        pbe.clearPassword()
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(128, iv))
        return String(cipher.doFinal(encrypted), Charsets.UTF_8)
    }

    private fun prepareModelImport(uri: Uri) {
        if (!modelBusy.compareAndSet(false, true)) { event("modelError", "El motor está ocupado; vuelve a intentarlo."); return }
        scope.launch {
            try {
                if (model != null) throw IllegalStateException("Descarga el modelo actual antes de cambiarlo: reinicia MORRISON para importar otro.")
                val maxBytes = 1_500_000_000L
                val temp = File(filesDir, "morrison-model.tmp")
                try {
                    contentResolver.openInputStream(uri)?.use { input ->
                        FileOutputStream(temp).use { out ->
                            val buf = ByteArray(1024 * 128)
                            var total = 0L
                            while (true) {
                                val n = input.read(buf)
                                if (n < 0) break
                                total += n
                                if (total > maxBytes) throw IllegalArgumentException("Usa un modelo GGUF inferior a 1,5 GB")
                                out.write(buf, 0, n)
                                if (total % (40 * 1024 * 1024) < buf.size) event("modelProgress", "Copiando modelo: ${total / (1024 * 1024)} MB")
                            }
                            out.fd.sync()
                        }
                    } ?: throw IllegalArgumentException("No fue posible abrir el archivo")
                    if (temp.length() < 1_000_000) throw IllegalArgumentException("Archivo GGUF demasiado pequeño")
                    temp.inputStream().use {
                        val bytes = ByteArray(4)
                        if (it.read(bytes) != 4 || String(bytes, Charsets.US_ASCII) != "GGUF") throw IllegalArgumentException("El archivo no es un modelo GGUF válido")
                    }
                    if (modelFile.exists() && !modelFile.delete()) throw IllegalStateException("No se pudo reemplazar el modelo anterior")
                    if (!temp.renameTo(modelFile)) throw IllegalStateException("No se pudo guardar el modelo")
                    event("modelImported", "Modelo GGUF importado (${modelFile.length() / (1024 * 1024)} MB). Ya puedes cargarlo.")
                } finally { if (temp.exists()) temp.delete() }
            } catch (e: Exception) { event("modelError", e.message ?: "No se pudo importar el modelo") }
            finally { modelBusy.set(false) }
        }
    }

    private fun loadModel() {
        if (!modelFile.exists()) { event("modelError", "Primero descarga e importa un modelo GGUF de 0,5B."); return }
        if (!modelBusy.compareAndSet(false, true)) { event("modelError", "El motor está trabajando."); return }
        scope.launch {
            try {
                if (model == null) {
                    event("modelProgress", "Cargando IA local en la memoria del dispositivo…")
                    model = Llama.loadModel(modelFile.absolutePath, LlamaConfig(contextSize = 1024, threads = 4, gpuLayers = 0, temperature = 0.45f))
                }
                event("modelReady", "IA local lista: sin internet, sin API y sin pagos.")
            } catch (e: Throwable) { event("modelError", "No fue posible cargar el modelo: ${e.message ?: "memoria insuficiente"}") }
            finally { modelBusy.set(false) }
        }
    }

    private fun replyFromModel(prompt: String) {
        if (prompt.length > 2800) { event("modelError", "La pregunta es demasiado extensa."); return }
        if (!modelBusy.compareAndSet(false, true)) { event("modelError", "MORRISON está generando otra respuesta."); return }
        scope.launch {
            try {
                val active = model ?: throw IllegalStateException("Importa y carga primero el modelo GGUF")
                event("modelProgress", "Pensando en el dispositivo…")
                val response = Llama.complete(
                    active,
                    prompt = prompt,
                    systemPrompt = "Eres MORRISON, un asistente personal técnico de habla española de Chile. Responde con precisión, concisión y tono profesional. Estás funcionando TOTALMENTE SIN INTERNET. Si te preguntan por noticias recientes, el clima o información actual, reconoce que no tienes acceso en vivo. No inventes acciones realizadas, archivos leídos ni resultados verificados. No generes comandos peligrosos.",
                    maxTokens = 220
                )
                val text = response.text.trim().take(2200)
                event("modelAnswer", JSONObject().put("text", text.ifBlank { "El modelo no generó una respuesta." }).put("speed", response.tokensPerSecond.toDouble()).toString())
            } catch (e: Throwable) {
                event("modelError", "Error de inferencia local: ${e.message ?: "modelo no disponible"}")
            } finally { modelBusy.set(false) }
        }
    }

    inner class DeviceBridge {
        @JavascriptInterface fun loadState(): String = loadEncryptedState()
        @JavascriptInterface fun saveState(json: String) {
            try { saveEncryptedState(json) } catch (e: Exception) { event("storageError", "No se pudieron guardar los datos cifrados: ${e.message}") }
        }
        @JavascriptInterface fun hasModel(): Boolean = modelFile.exists() && modelFile.length() > 1_000_000
        @JavascriptInterface fun modelSizeMb(): Long = if (modelFile.exists()) modelFile.length() / (1024 * 1024) else 0
        @JavascriptInterface fun importModel() = runOnUiThread {
            val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).setType("*/*").addCategory(Intent.CATEGORY_OPENABLE)
            startActivityForResult(intent, activityFileChooseModel)
        }
        @JavascriptInterface fun loadModel() = this@MainActivity.loadModel()
        @JavascriptInterface fun askLocal(prompt: String) = replyFromModel(prompt)
        @JavascriptInterface fun record() = runOnUiThread { beginSpeech() }
        @JavascriptInterface fun stopRecord() = runOnUiThread { recognizer?.cancel() }
        @JavascriptInterface fun speak(text: String) = runOnUiThread {
            val engine = tts ?: return@runOnUiThread
            val offline = engine.voice?.let { !it.isNetworkConnectionRequired && it.locale.language == "es" } == true
            if (!offline) {
                val v = engine.voices?.firstOrNull { !it.isNetworkConnectionRequired && it.locale.language == "es" }
                if (v != null) engine.voice = v
                else { event("ttsStatus", "No hay voz española sin conexión instalada. Revisa Ajustes → Texto a voz."); return@runOnUiThread }
            }
            engine.speak(text.take(1200), TextToSpeech.QUEUE_FLUSH, null, "morrison-answer")
        }
        @JavascriptInterface fun stopSpeak() = runOnUiThread { tts?.stop() }
        @JavascriptInterface fun getVoices(): String = availableVoices()
        @JavascriptInterface fun chooseVoice(name: String) = runOnUiThread {
            val option = tts?.voices?.firstOrNull { it.name == name && it.locale.language == "es" && !it.isNetworkConnectionRequired }
            if (option != null) { tts?.voice = option; prefs.edit().putString("voice", name).apply(); event("ttsStatus", "Voz local seleccionada: $name") }
            else event("ttsStatus", "Voz sin conexión no disponible.")
        }
        @JavascriptInterface fun exportBackup(text: String, password: String) = runOnUiThread {
            if (text.length > 2_000_000 || password.length < 12) { event("backupError", "Usa una contraseña de 12 caracteres o más y un respaldo válido."); return@runOnUiThread }
            exportPending = text to password
            val intent = Intent(Intent.ACTION_CREATE_DOCUMENT)
                .addCategory(Intent.CATEGORY_OPENABLE)
                .setType("application/json")
                .putExtra(Intent.EXTRA_TITLE, "MORRISON-local-${System.currentTimeMillis()}.json")
            startActivityForResult(intent, activityFileExport)
        }
        @JavascriptInterface fun importBackup(password: String) = runOnUiThread {
            importPassword = password
            val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("application/json")
            startActivityForResult(intent, activityFileImport)
        }
        @JavascriptInterface fun openModelDownload() = runOnUiThread {
            val url = Uri.parse("https://huggingface.co/bartowski/Qwen2.5-0.5B-Instruct-GGUF/blob/main/Qwen2.5-0.5B-Instruct-Q4_K_M.gguf")
            startActivity(Intent(Intent.ACTION_VIEW, url))
        }
    }

    @Deprecated("Android activity result bridge")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (resultCode != RESULT_OK || data?.data == null) {
            if (requestCode == activityFileExport) exportPending = null
            return
        }
        val uri = data.data!!
        when (requestCode) {
            activityFileChooseModel -> prepareModelImport(uri)
            activityFileExport -> {
                val pair = exportPending; exportPending = null
                if (pair != null) scope.launch {
                    try {
                        val bytes = makeBackup(pair.first, pair.second)
                        contentResolver.openOutputStream(uri, "wt")?.use { it.write(bytes) }
                            ?: throw IllegalStateException("No se pudo escribir el archivo")
                        event("backupExported", "Respaldo cifrado guardado. Comparte el archivo por Nearby Share o LocalSend.")
                    } catch (e: Exception) { event("backupError", "Fallo al exportar: ${e.message}") }
                }
            }
            activityFileImport -> {
                val pass = importPassword.orEmpty(); importPassword = null
                scope.launch {
                    try {
                        val bytes = contentResolver.openInputStream(uri)?.use { input ->
                            val out = java.io.ByteArrayOutputStream()
                            val chunk = ByteArray(8192)
                            while (out.size() <= 8_000_000) {
                                val len = input.read(chunk)
                                if (len < 0) break
                                out.write(chunk, 0, len)
                            }
                            out.toByteArray()
                        } ?: throw IllegalStateException("Archivo inaccesible")
                        val parsed = decodeBackup(bytes, pass)
                        event("backupImported", parsed)
                    } catch (e: Exception) { event("backupError", "No se pudo importar: ${e.message}") }
                }
            }
        }
    }

    override fun onDestroy() {
        recognizer?.destroy(); recognizer = null
        tts?.stop(); tts?.shutdown(); tts = null
        scope.cancel()
        if (model != null) try { Llama.releaseModel(model!!) } catch (_: Throwable) {}
        web.removeJavascriptInterface("MorrisonNative")
        web.destroy()
        super.onDestroy()
    }
}