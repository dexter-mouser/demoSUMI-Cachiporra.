# SumiPorra — Fargo Suministros

Juego de mostrador para grupos, pensado para jugarse **en un solo teléfono o tablet** que se pasa de mano en mano. Cada persona elige un número secreto y, por turnos, se tachan números de un tablero compartido. Pierde quien tache un número que no debía y cumple el premio elegido al inicio.

No necesita instalación, servidor ni conexión: es HTML, CSS y JavaScript plano.

## Cómo ejecutarlo

1. Descomprime la carpeta `sumiporra-app/` y conserva su estructura interna.
2. Abre `index.html` con doble clic o arrástralo a un navegador moderno (Chrome, Safari, Edge, Firefox).
3. Funciona sin internet. La tipografía Poppins se descarga si hay conexión; si no, se usa la fuente del sistema.

## Qué puede hacer la app

- **Pantalla de inicio** con acceso directo a jugar y al botón "Cómo jugar", disponible en todo momento desde la barra superior. Tocar el logo de Fargo lleva siempre de vuelta al inicio (si hay una partida en curso, pide confirmación).
- **De 2 a 10 jugadores** con nombres personalizables ("Jugador N" si se deja vacío).
- **Tablero configurable:** números del 1 al 10 por defecto, ajustables entre 5 y 20.
- **Premios para quien pierda:** dos prediseñados (Gaseosa y Tinto) y uno personalizado que se escribe a mano.
- **Elección secreta por relevo:** antes de cada elección se pide pasar el dispositivo a la persona indicada.
- **Tachado en dos toques:** el primero resalta el número y el segundo lo confirma. Un aviso inferior lo recuerda y permite cancelar.
- **Animación de eliminación:** cuando se elimina a un jugador aparece una mano con el número tachado dibujado, el nombre del eliminado y quién ganó la ronda. La pantalla se cierra sola a los pocos segundos o al tocarla.
- **Seguimiento en vivo:** turno actual con aviso destacado, fichas de jugadores (activos o eliminados) y resumen del último movimiento.
- **Desempate automático** cuando el último número lo comparten varios jugadores.
- **Pantalla final** con quién perdió, el motivo, el premio y quiénes quedan a salvo; permite jugar de nuevo conservando los ajustes.
- **Diseño para celular** con los colores de Fargo Suministros.

## Reglas del juego

1. Juegan de 2 a 10 personas. Cada una elige en privado un número del tablero; los números pueden repetirse.
2. Por turnos, cada jugador tacha un número.
3. Al tachar un número:
   - Si ya estaba tachado, no ocurre nada.
   - Si es **tu propio número**, pierdes al instante.
   - Si es el número de **un solo jugador vivo**, ese jugador queda eliminado. Si solo queda un jugador vivo, ese pierde.
   - Si es el número de **dos o más jugadores vivos**, pierdes tú.
   - Si **nadie** lo tiene, no pasa nada y sigue el turno.
4. **Tablero agotado:** si el último número disponible lo comparten dos o más jugadores vivos, se juega un desempate solo entre ellos con un tablero nuevo y nuevos números secretos. Si vuelve a empatar, se repite.
5. Quien pierde la partida cumple el premio; todos los demás quedan a salvo.

## Estructura de carpetas

```
sumiporra-app/
├── index.html
├── README.md
├── css/style.css          # Colores de marca y estilos
├── js/
│   ├── constantes.js      # Límites, premios, pantallas y tipos de evento
│   ├── motor.js           # Reglas del juego (lógica pura, sin DOM)
│   ├── iconos.js          # Iconos SVG en línea
│   ├── estado.js          # Estado de la partida y controlador
│   ├── vista.js           # Pantallas, animación de la mano y ayuda
│   └── principal.js       # Arranque y manejo de eventos
└── assets/                # Logo de Fargo y favicons de SumiPorra
```

Los scripts se cargan en ese orden porque cada uno usa lo definido por el anterior (sin módulos ES, para que abra con doble clic).

## Personalización

- **Colores:** variables al inicio de `css/style.css`.
- **Límites, rango y premios:** `js/constantes.js` (`JUGADORES_MAX`, `RANGO_MIN`, `RANGO_MAX`, `PREMIOS`, `DURACION_MANO_MS`).
- **Reglas:** `resolverTachado` en `js/motor.js`; el orden de las comprobaciones forma parte de la regla.
- **Mano animada:** función `htmlMano` en `js/vista.js` y las animaciones `mano-*` en el CSS.
