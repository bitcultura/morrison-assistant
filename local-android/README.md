# MORRISON Local 3.0 — Android, sin nube ni pagos

**Estado de entrega:** proyecto Android completo (fuentes) con interfaz comprobada mediante pruebas automatizadas en Chromium. El APK solo puede considerarse probado tras compilarlo e instalarlo en un teléfono Android real. No se incluye el modelo GGUF (≈398 MB), que se descarga por separado una sola vez.

## Objetivo

Una aplicación independiente con identificador `cl.morrison.local` para el Samsung Galaxy A16 5G y Galaxy Tab A9. No necesita Railway, n8n, Firebase, GitHub, Auth0, Google Gemini ni OpenAI para ejecutarse.

La aplicación **no solicita permiso INTERNET**. Usa WebViewAssetLoader para cargar una interfaz empaquetada como recurso local y Android Keystore AES-256-GCM para cifrar datos de proyectos, tareas, notas y conversación en almacenamiento privado. El APK lleva una biblioteca de `llama.cpp` (Maven Central) que ejecuta archivos de modelos GGUF directamente en el dispositivo.

## Qué hace

- Conversación en español por texto con motor GGUF local (una vez importado y cargado).
- Comandos inmediatos para tareas, proyectos, notas, hora y navegación sin necesitar un modelo.
- Dictado por **SpeechRecognizer.createOnDeviceSpeechRecognizer** solo cuando Android reporte soporte local y se pulse el botón. No hay escucha permanente con pantalla apagada.
- Respuesta hablada con Android TextToSpeech usando voces españolas **sin conexión**, si están instaladas.
- Crear, completar y eliminar tareas; proyectos; notas y preferencias.
- Chat local con historial cifrado en el dispositivo.
- Respaldo AES-256-GCM + PBKDF2 (250.000 iteraciones), exportable mediante el selector de archivos Android. Importación tras confirmación.
- Puede importar el JSON sin cifrar exportado desde MORRISON PWA anterior (proyectos, tareas, notas). **No modifica ni borra la versión existente.**
- Transferencia de respaldos **manual** mediante Quick Share o LocalSend. No hay sincronización automática mientras los dispositivos estén separados.

## Instalación de APK

1. Obtén el archivo `app-debug.apk` desde la compilación Android (si existe), ábrelo en el Samsung y autoriza **solo esa instalación** desde la aplicación de archivos.
2. Abre «MORRISON Local» — no sobrescribe la PWA anterior, porque tiene otro identificador.
3. En **Ajustes → Cerebro IA**, toca «Abrir descarga» para visitar la página original del modelo, usando tu navegador externo.
4. Descarga `Qwen2.5-0.5B-Instruct-Q4_K_M.gguf` de bartowski (aprox. 398 MB) con Wi-Fi. El enlace es https://huggingface.co/bartowski/Qwen2.5-0.5B-Instruct-GGUF/blob/main/Qwen2.5-0.5B-Instruct-Q4_K_M.gguf . Esta descarga inicial es externa a MORRISON y puede consumir datos del usuario.
5. Regresa a MORRISON → **Importar archivo GGUF**, selecciónalo desde Descargas, aguarda la copia; pulsa **Cargar IA local**.
6. Entra a **Conversación** y prueba «Hola, Morrison» y «Explícame qué es una nebulosa».
7. Para voz, instala en Android un paquete de español sin conexión si el sistema informa que aún no hay reconocimiento o voces compatibles.

El modelo Qwen 0.5B es pequeño: su calidad es mucho menor que GPT/Gemini y puede alucinar. Los tiempos de respuesta y el uso de RAM deben medirse en ambos Samsung.

## Pasar datos del MORRISON anterior

En la aplicación MORRISON original: exporta sus proyectos, tareas y notas a un archivo JSON usando **Exportar**. Luego en MORRISON Local: Ajustes → Importar respaldo, elige ese JSON. Se preguntará explícitamente antes de reemplazar datos locales. **Si el respaldo original está cifrado en la nube**, primero restáuralo en la aplicación antigua y expórtalo como JSON local desde ella; MORRISON Local no conoce la frase ni los parámetros de Auth0/servidor.

## Transferir a la tablet sin nube

En teléfono, escribe una frase de respaldo privada de 12 o más caracteres, toca **Exportar respaldo cifrado**. Comparte el archivo generado con Quick Share o LocalSend (la transferencia puede requerir Wi-Fi local, no internet). En la tablet, instala MORRISON Local, introduce la misma frase y usa **Importar respaldo**. Se solicitará confirmación antes de reemplazar datos.

No hay recuperación de una frase olvidada. Guardarla fuera de la aplicación es responsabilidad del usuario. Ni la frase ni el historial se envían al asistente de chat.

## Compilación en Android Studio

- JDK 17; Android SDK 35 / Build Tools 35.0.0.
- Gradle 8.11.1 y Android Gradle Plugin 8.9.2.
- En Android Studio, **Open** la carpeta raíz del proyecto y ejecutar `:app:assembleDebug`, o con Gradle disponible: `gradle :app:assembleDebug`.
- El APK de depuración se generará en `app/build/outputs/apk/debug/app-debug.apk`.
- Librería de inferencia: `dev.ffmpegkit-maintained:llama-android:0.1.1` (precompilada; solo ARM64). En tiempo de compilación se necesitan Google Maven y Maven Central; en tiempo de uso del APK, no.
- `androidx.webkit:webkit:1.14.0` y coroutines.

## Seguridad y límites

- No existen llamadas HTTP remotas ni permiso INTERNET en el manifiesto Android.
- Solo se carga código local `https://appassets.androidplatform.net/assets/` mediante WebViewAssetLoader; no abrir contenido remoto en ese WebView.
- El modelo GGUF no es código JavaScript ni un enlace de instrucciones arbitrarias; la aplicación valida firma `GGUF` y tamaño máximo 1.5 GB antes de importarlo.
- El micrófono se activa manualmente, exclusivamente si el sistema dispone de reconocedor local.
- No hay servicios en segundo plano, automatización permanente, calendario real conectado, ni activación por palabra desde pantalla bloqueada.
- El almacenamiento Keystore mantiene datos cifrados en el dispositivo; el respaldo exportado tiene una frase de cifrado independiente. No se garantiza recuperación si se pierde el dispositivo y no existe un respaldo externo.
- Desinstalar esta aplicación elimina los datos guardados en su espacio privado y el modelo importado.
- Los modelos pequeños no siempre comprenderán instrucciones complejas. No se debe confiar en ellos para decisiones médicas, financieras ni de seguridad.

## Pruebas realizadas en este entorno

Se verificó con Playwright/Chromium a resoluciones 412×915 y 800×1280 la navegación, creación de proyectos, tareas y notas, comandos locales, guardado al puente simulado y ausencia de desbordamiento horizontal. No es equivalente a validar el APK en el Samsung real.

## Licencias y fuentes

- Motor de inferencia `dev.ffmpegkit-maintained:llama-android:0.1.1`: proyecto MIT con llama.cpp, ver https://github.com/ffmpegkit-maintained/llama-android .
- Modelo recomendado `bartowski/Qwen2.5-0.5B-Instruct-GGUF` (Apache 2.0, no incluido): https://huggingface.co/bartowski/Qwen2.5-0.5B-Instruct-GGUF .
- Android WebViewAssetLoader / SpeechRecognizer: documentación de Android Developers.

MORRISON Local es una aplicación distinta de la PWA anterior. Los nombres y recursos de terceros siguen siendo de sus propietarios. No usa ni reproduce voces registradas de personajes cinematográficos.