# MORRISON 1.2 — Instalación y pruebas en Galaxy A16 + Galaxy Tab A9

**URL oficial del prototipo:** https://bitcultura.github.io/morrison-assistant/

## Actualizar sin perder los proyectos

1. Abre MORRISON desde el navegador o icono instalado.
2. En **Ajustes** pulsa **Buscar actualización**. Si el botón aún no aparece, abre el enlace anterior añadiendo `?v=120#ajustes` en Chrome y recarga una vez.
3. Comprueba que aparezca **MORRISON 1.2.0**.
4. Si Chrome mantiene una vista antigua, cierra únicamente la app MORRISON y vuelve a abrirla con conexión. No uses «Borrar datos» ni elimines almacenamiento local si aún tienes notas/tareas.
5. Si falla la actualización, descarga el respaldo JSON desde la versión antigua antes de limpiar la caché.

## Pruebas

- **Proyectos:** abre Proyectos → Cargar nombres conocidos → confirma. Verifica cinco nombres, sin pretender que tengan datos sincronizados.
- **Tareas:** añade una tarea y márcala completada; cierra y abre la app, debe persistir.
- **Voz:** Ajustes → Probar síntesis. Con la app visible, activa escucha y di «Morrison, abre proyectos» o «Morrison, abre economía».
- **Voz + escritura local:** di «Morrison, agrega tarea revisar agenda» y confirma el cuadro antes de guardar.
- **Economía:** registra un movimiento CLP de prueba (ej. 100), verifica balance y elimínalo.
- **Respaldo seguro:** Ajustes → Exportar respaldo cifrado → utiliza una contraseña única de 12+ caracteres; envía el archivo **por un medio privado** a tu otro Samsung y usa Importar respaldo cifrado. **Esto sobrescribe los datos locales del destino**.
- **Sin conexión:** carga la web al menos una vez con internet, activa modo avión y comprueba que las secciones y notas previamente guardadas se abran. Los enlaces externos y reconocimiento de voz pueden requerir conectividad.

## Estado real

La aplicación es una PWA estática. ChatGPT Plus abre en su propia app. Sin API de pago. Los datos no se sincronizan solos: solo respaldo/importación manual cifrado. La voz con pantalla bloqueada no es fiable ni está implementada. Las llamadas n8n requieren importar un webhook autorizado y probarlo.

## Privacidad

Este sitio y el repositorio GitHub son públicos. Los datos escritos en el panel se guardan **localmente en el navegador** en texto sin cifrar. El **archivo de respaldo** se cifra con AES-GCM y PBKDF2; si olvidas la contraseña no podrá recuperarse. No introduzcas secretos, claves, documentos personales, cuentas bancarias ni datos confidenciales en la PWA. Evita dispositivos compartidos.
