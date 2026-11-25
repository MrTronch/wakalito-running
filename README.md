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
- Móvil: pantalla vertical; desliza hacia arriba para saltar y hacia abajo para rodar, en cualquier zona libre del juego. El roll completa su animación. Pausa y sonido siguen en los botones superiores.
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

## Monedas y Wakalito Rage

Las monedas doradas usan `coin.glb`; son distintas de la chacana de piedra decorativa. Las normales suman 10 puntos; la especial ×5 suma 5 puntos y cinco monedas. Puntuación total = metros enteros + puntos de las recogidas. El récord de distancia conserva `wakalito-best`; el de puntos se guarda aparte en `wakalito-best-score`.

Cada 100 monedas del medidor se activa Rage durante 10 segundos de juego: aceleración suave de 1,25× en el primer Rage, 1,35× en el segundo y 1,45× en el tercero, invencibilidad, aura dorada y música especial. Las rocas se fragmentan y los dragones salen expulsados enteros. Las monedas recogidas durante Rage cuentan y cargan la siguiente activación, sin prolongar la actual. La pausa congela el temporizador y los efectos. El aura parpadea durante los últimos tres segundos.

Configuración: `src/rage.js` (`RAGE_CONFIG`), `src/gestures.js` (`SWIPE_CONFIG`, umbral de 32 px) y `src/coins.js` (separación y distribución). No se añaden cactus dañinos al generador actual: los cactus del escenario siguen siendo decoración. La reacción de un eventual cactus obstáculo está implementada y probada.

Para actualizar, vuelve a compilar antes de subir `docs/`. El exportador local archiva los archivos compilados obsoletos fuera de la carpeta GitHub para evitar acumular versiones antiguas. No se necesita subir WAV originales adicionales, archivos `.asd`, Blender ni el ejecutable.


### Moneda ×5 y destellos dorados

Se usa `coinx5.glb`, conservando su color original y añadiendo un halo dorado. Una de cada 10 monedas generadas es ×5, en una posición aleatoria independiente para cada bloque. Vale 5 monedas, 5 puntos y 5 unidades del medidor Rage. No extiende un Rage activo. Configuración: `bonusEvery` y `bonusValue` en `src/coins.js`.

El Rage ahora utiliza destellos de cuatro puntas con brillo suave en lugar de una malla alrededor del personaje. Se mantiene el parpadeo durante los últimos 3 segundos. Texturas procedurales compartidas y partículas reutilizables, sin efectos de posprocesado.

La puntuación acumula por separado los puntos de cada recogida: moneda normal +10 puntos; moneda ×5 +5 puntos, según el ajuste solicitado. La ×5 mantiene +5 monedas y +5 de carga Rage. `coin.wav` suena en cada recogida. Durante Rage aumentan los sparkles y el polvo, y el temporizador avisa TERMINA EN durante los últimos tres segundos.


### Ajustes vigentes de presentación y audio

Grupos de 3 a 5 monedas; la especial ×5 aparece una vez por cada 10 monedas generadas, en posición aleatoria. Se conservan sus valores (+5 puntos, +5 monedas, +5 de carga Rage). Acabado metálico con un entorno de reflejos compartido sólo por las monedas. Rage sin líneas de velocidad; partículas doradas más dispersas.

Pausa con fondo oscuro, texto claro, título más pequeño en mayúsculas, mayor interlineado y espaciado. `begin rage.wav` suena junto con el inicio del loop Rage, sin esperar a que acabe el efecto; `end rage.wav` suena al terminar el poder. El loop normal sube de ganancia 0,65 a 0,9. Los WAV de ambos loops se actualizaron desde los originales y sus peticiones incluyen versión de caché.


### Cabeza clava y reducción de peso

Tres cabezas clava animadas se reciclan como elementos de fondo, a más de nueve unidades del camino. No tienen colisión dañina. Se comparten geometrías y materiales, con esqueletos independientes.

La cantidad procedural de monedas aumenta un 25 % mediante un acumulador de densidad, manteniendo los márgenes con los obstáculos. La especial ×5 reproduce `coin.wav` seis semitonos más agudo. Begin Rage usa el doble de ganancia (1,6 frente a 0,8), sin alterar End Rage. Rage añade más partículas y una luz dorada local sin sustituir las texturas del personaje.

Los loops para navegador son copias MP3; los WAV originales permanecen en la carpeta de trabajo. Las copias web del arbusto y la clava usan WebP sin pérdida adicional tras reducir sus texturas a un máximo de 1024 px. No se alteran mallas, rig ni clips. Los GLB originales permanecen en `01 3d elements`. La optimización reduce tráfico y memoria de texturas. El tamaño de GitHub incluye tanto fuente como sitio compilado; el navegador no descarga ambas copias.


### Inicio y pausa unificados

Inicio, pausa y derrota comparten fondo oscuro translúcido y textos claros. En el inicio se elimina el título repetido y se coloca el personaje 3D con el clip idle existente bajo Una aventura en los Andes. La vista reutiliza el modelo y las texturas ya cargados; no añade otra descarga. El personaje de presentación se deja de renderizar al comenzar la partida. La frase inferior El camino de los ancestros se oculta mientras cualquier menú está abierto.

Tamaños aproximados de esta edición: carpeta GitHub 66,8 MiB (antes 85,6); sitio compilado 33,6 MiB (antes 43,4). Reducción cercana al 22 %, incluyendo la nueva cabeza clava. Los originales permanecen intactos. La comprobación móvil se realiza en vista vertical de escritorio; no sustituye una prueba física en iOS/Android.


### Noche, estrellas y ave Nazca

El cielo pasa gradualmente de atardecer a noche entre 900 y 1000 metros, con iluminación más fría, niebla nocturna y estrellas que parpadean suavemente. Después de 1000 metros permanece de noche. Los indicadores cambian a tonos claros para conservar su lectura. La pausa detiene el tiempo de estrellas y apariciones; una partida nueva vuelve al día.

`ave-nazca.glb` aparece ocasionalmente, pequeña y a profundidad detrás de las montañas. Conserva el azul del emisor y añade un halo del mismo color, sin posprocesado. Primera aparición nocturna tras 8–16 segundos; duración de 12 segundos; siguientes apariciones tras 80–140 segundos. No tiene colisiones. Parámetros en `src/night.js` (`NIGHT_CONFIG`).

Prueba local de desarrollo: `?qa=dusk` comienza a 900 metros sin obstáculos para observar la transición; `?qa=night` comienza a 1000 y adelanta la primera aparición a 2 segundos. No guarda récords y las ayudas no existen en producción.

El título Una aventura en los Andes y el Wakalito del inicio son más grandes. Moneda normal: volumen 0,4; ×5: 1,6, conservando seis semitonos de subida. Las rocas destruidas durante Rage reproducen el archivo original `rock.wav`; los dragones conservan su impacto anterior.


### Balance y encuadre móvil vigentes

La densidad procedural es un 25 % mayor que la distribución base. El sonido roll usa ganancia 1,6 (doble de la anterior). Los Rage de una partida progresan 1,25×, 1,35×, 1,45× y suman 0,10 por activación posterior; no se multiplican entre sí. Al terminar, una transición de 0,18 segundos reduce temporalmente el ritmo al 85 % de la velocidad normal de la dificultad actual, que se recupera suavemente dentro de tres segundos. No se añade invencibilidad durante la recuperación. La pausa congela esa recuperación y el reinicio devuelve el primer Rage a 1,25×. Configuración en RAGE_CONFIG de src/rage.js.

Se refuerzan tamaño, brillo y variación del parpadeo de las estrellas; ave Nazca aproximadamente un 43 % mayor. El encuadre vertical pasa de 10 a 10,6 unidades de ancho (6 % de zoom out), manteniendo la posición horizontal y la física del personaje.

Optimización adicional: copia web del arbusto con 59.537 polígonos en vez de 108.250, sin tocar el GLB original. Su tamaño baja de 10,55 a 8,62 MiB. scripts/optimize-shrub-geometry.py se ejecuta con Blender en segundo plano y scripts/optimize-scenery.py aplica luego las texturas WebP. El resto de modelos, rig y animaciones se conserva.
