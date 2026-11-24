# Wakalito Running · edición web

**[Jugar Wakalito Running](https://mrtronch.github.io/wakalito-running/)** · by Mr Tronch

[Repositorio del proyecto](https://github.com/MrTronch/wakalito-running)

Endless runner 3D de Ancestralia. Edición pública con teclado y controles táctiles, sin cámara ni MediaPipe. Los modelos 3D y texturas forman parte del proyecto; los efectos se sintetizan localmente con Web Audio. No requiere servidor de aplicación ni servicios externos.

## Iniciar

Instala Node.js 22.12 o posterior (recomendado 24), abre la carpeta extraída y ejecuta:

```sh
npm install
npm run dev
```

`npm test` ejecuta las pruebas. `npm run build` genera `dist-public/`. `npm run preview` permite probar esa compilación.

## Controles

- Escritorio: Espacio/arriba para saltar; abajo/S para agacharse mientras se mantiene la tecla; P para pausa.
- Al perder, el menú espera medio segundo antes de habilitar el reinicio para evitar toques accidentales.
- Móvil: pantalla vertical; toca SALTAR o RODAR. Cada toque de RODAR completa una vuelta. Se puede pausar y silenciar desde los botones superiores.
- El sonido comienza después de tocar o pulsar una tecla. Incluye el loop ambiental original, que se pausa al pausar o perder.
- Se adapta también a horizontal, sin obligar al navegador a bloquear la orientación.

## Publicar en GitHub Pages (método recomendado)

1. Sube el contenido actualizado de la carpeta `GitHub` a la raíz del repositorio, incluida la carpeta **docs**. Sustituye los archivos anteriores.
2. Abre **Settings → Pages → Build and deployment → Source → Deploy from a branch**.
3. Selecciona **main** y **/docs**. Pulsa **Save**.
4. Espera a que termine el despliegue y abre https://mrtronch.github.io/wakalito-running/ . Recarga la página para evitar la copia anterior en caché.

`docs/` contiene el sitio ya compilado: HTML, estilos, JavaScript, logo, modelos y sonidos. No abras la raíz del código fuente como sitio estático: ese `index.html` necesita Vite. La ruta correcta para Pages con este método es `/docs`, no `/(root)`.

El fallo anterior ocurría porque Pages servía directamente el HTML fuente, que pedía `/src/main.js`; el logo estaba en `public/` y tampoco correspondía a la ruta pública. Además faltaba `.github/workflows/pages.yml` en el repositorio subido, por lo que no se ejecutaba la compilación automática.

Como alternativa, puedes subir la carpeta oculta `.github` y elegir **GitHub Actions** como Source: el flujo compila y publica automáticamente. Usa uno de los dos métodos.

Esta edición no contiene cámara ni MediaPipe. No subas dependencias instaladas, cachés, ejecutables ni archivos Blender. El enlace del README será jugable cuando el despliegue termine correctamente.

## Compatibilidad y rendimiento

Requiere un navegador con WebGL 2 y aceleración gráfica. Está preparado para Safari de iOS y Chrome de Android actuales, pero la fluidez depende del teléfono. La revisión en escritorio con vista móvil no sustituye una prueba en dispositivos físicos. En móvil se limita la resolución de render a 1,35× y el mapa de sombras a 1024²; los modelos se cargan una vez y se reutilizan. La mejor marca y el ajuste de sonido se guardan en el navegador cuando es posible.

Pendiente para una optimización posterior: reducir geometría y mapas del arbusto (el asset más grande), comprimir texturas y eliminar animaciones no usadas de una copia del personaje. No se ha reducido destructivamente la calidad de los originales ni se ha cambiado el rig. Los tamaños exactos de esta entrega están en `pesos-y-verificacion.json`, junto a los ZIP.

Ver `CREDITOS.md` para la procedencia de los recursos. La publicación del repositorio y los permisos de reutilización de los assets son decisiones distintas: esta entrega no asigna una licencia abierta a los modelos o al logo.
