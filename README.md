# Wakalito Running · edición web

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
- Móvil: pantalla vertical; toca SALTAR o RODAR. Cada toque de RODAR completa una vuelta. Se puede pausar y silenciar desde los botones superiores.
- El sonido comienza después de tocar o pulsar una tecla. Incluye el loop ambiental original, que se pausa al pausar o perder.
- Se adapta también a horizontal, sin obligar al navegador a bloquear la orientación.

## Publicar hoy en GitHub Pages

1. Usa todos los archivos de la carpeta `GitHub` preparada junto al proyecto local, incluida `.github`. También puedes usar el contenido de `wakalito-github-sin-camara.zip`. Descomprime el ZIP y sube **su contenido**, no el ZIP, a la raíz de un repositorio público. Incluye la carpeta oculta `.github`.
2. En GitHub, abre **Settings → Pages → Source → GitHub Actions**.
3. Sube los cambios a la rama `main`, o ejecuta el flujo desde **Actions → Publicar Wakalito Running → Run workflow**.
4. Espera a que finalice. La dirección del juego aparece en Pages y en el despliegue de Actions.

El archivo `wakalito-web-sin-camara.zip` contiene solamente el sitio ya compilado; sirve para un alojamiento estático. El ZIP de GitHub incluye fuentes y el flujo de publicación, que construye el sitio automáticamente. Las rutas relativas admiten un repositorio bajo `usuario.github.io/nombre-del-repositorio/`.

No subas `node_modules`, `.npm-cache`, `dist`, ejecutables, Blender ni la carpeta local completa. Este paquete ya los excluye, al igual que todo el código y los modelos de cámara. Los cambios de esta edición no publican nada automáticamente desde el equipo local.

## Compatibilidad y rendimiento

Requiere un navegador con WebGL 2 y aceleración gráfica. Está preparado para Safari de iOS y Chrome de Android actuales, pero la fluidez depende del teléfono. La revisión en escritorio con vista móvil no sustituye una prueba en dispositivos físicos. En móvil se limita la resolución de render a 1,35× y el mapa de sombras a 1024²; los modelos se cargan una vez y se reutilizan. La mejor marca y el ajuste de sonido se guardan en el navegador cuando es posible.

Pendiente para una optimización posterior: reducir geometría y mapas del arbusto (el asset más grande), comprimir texturas y eliminar animaciones no usadas de una copia del personaje. No se ha reducido destructivamente la calidad de los originales ni se ha cambiado el rig. Los tamaños exactos de esta entrega están en `pesos-y-verificacion.json`, junto a los ZIP.

Ver `CREDITOS.md` para la procedencia de los recursos. La publicación del repositorio y los permisos de reutilización de los assets son decisiones distintas: esta entrega no asigna una licencia abierta a los modelos o al logo.
