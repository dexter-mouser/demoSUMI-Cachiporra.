# SumiPorra — Fargo Suministros

Juego de mostrador para grupos, pensado para jugarse **en un solo teléfono o tablet** que se pasa de mano en mano. Cada persona elige un número secreto y, por turnos, se tachan números de un tablero compartido. Pierde quien tache un número que no debía.

No necesita instalación, servidor ni conexión: es HTML, CSS y JavaScript plano.

---

## Cómo ejecutarlo

1. Descomprime la carpeta `sumiporra-app/` y conserva su estructura interna.
2. Abre `index.html` con doble clic o arrástralo a cualquier navegador moderno (Chrome, Safari, Edge, Firefox).
3. Funciona sin internet. La tipografía Poppins se descarga de Google Fonts cuando hay conexión; si no la hay, se usa la fuente del sistema.

---

## Qué puede hacer la app

- **Partidas de 2 a 10 jugadores**, con nombres personalizables (si se deja uno vacío se usa "Jugador N").
- **Apuesta configurable** que se muestra en la pantalla final (por defecto: "lo que se haya acordado").
- **Elección secreta por relevo:** antes de cada elección, una pantalla pide pasar el dispositivo a la persona indicada para que nadie vea el número de otra.
- **Tachado en dos toques:** un toque resalta el número y un segundo toque sobre el mismo lo confirma. Un aviso en la parte inferior recuerda volver a presionar y ofrece un botón para cancelar. Tocar otro número cambia la selección.
- **Tablero y jugadores en vivo:** se ven los números tachados, el turno actual y quién sigue en juego o ya fue eliminado.
- **Historial del último movimiento** bajo el tablero.
- **Desempate automático** cuando el último número del tablero lo comparten varios jugadores.
- **Pantalla final** con quién perdió, el motivo, la apuesta y quiénes quedan a salvo, con opción de jugar de nuevo conservando nombres y apuesta.
- **Botón "Cómo jugar"** siempre disponible en la barra superior.
- **Diseño para celular**, con la identidad visual de Fargo Suministros.

---

## Reglas del juego

1. Juegan de 2 a 10 personas. Cada una elige en privado un número del 1 al 10; los números pueden repetirse.
2. Por turnos, cada jugador tacha un número del tablero.
3. Al tachar un número:
   - Si ya estaba tachado, no ocurre nada.
   - Si es **tu propio número**, pierdes al instante.
   - Si es el número de **un solo jugador vivo**, ese jugador queda eliminado. Si solo queda un jugador vivo, ese pierde.
   - Si es el número de **dos o más jugadores vivos**, pierdes tú.
   - Si **nadie** lo tiene, no pasa nada y sigue el turno.
4. **Tablero agotado:** si el último número disponible lo comparten dos o más jugadores vivos, se juega un desempate solo entre ellos con un tablero nuevo, y cada uno elige un nuevo número secreto. Si el desempate vuelve a agotar el tablero con empate, se juega otro, y así sucesivamente.
5. Quien pierde la partida paga la apuesta acordada; todos los demás quedan a salvo.

---

## Estructura de carpetas

```
sumiporra-app/
├── index.html              # Documento raíz: enlaza estilos, recursos y scripts
├── README.md
├── css/
│   └── style.css           # Colores de marca y estilos de toda la app
├── js/
│   ├── constantes.js       # Límites de jugadores, tamaño del tablero, pantallas y tipos de evento
│   ├── motor.js            # Reglas del juego (lógica pura, sin DOM)
│   ├── iconos.js           # Iconos SVG en línea
│   ├── estado.js           # Estado de la partida y controlador
│   ├── vista.js            # Construcción de pantallas a partir del estado
│   └── principal.js        # Arranque y manejo de eventos
└── assets/
    ├── logo-fargo-suministros.png   # Logo del encabezado
    ├── favicon-32.png               # Ícono de pestaña (SumiPorra)
    ├── favicon-64.png
    └── favicon-180.png              # Ícono para pantalla de inicio en iOS
```

Los scripts se cargan en ese orden porque cada uno usa lo definido por el anterior (no se usan módulos ES, para que la app abra con doble clic).

---

## Personalización

- **Colores y estilo:** en `css/style.css`, todos los colores están centralizados en `:root` al inicio.
- **Cantidad de jugadores y tamaño del tablero:** en `js/constantes.js` (`JUGADORES_MIN`, `JUGADORES_MAX`, `TAMANO_TABLERO`).
- **Reglas:** en `js/motor.js`, dentro de `resolverTachado`. El orden de las comprobaciones forma parte de la regla.
- **Iconos:** se agregan al objeto `ICONOS` en `js/iconos.js` y se usan desde `js/vista.js`.
- **Textos de "Cómo jugar":** en la función `htmlAyuda` de `js/vista.js`.
