# La Cachiporra — Fargo Suministros

Juego web de "pasa el dispositivo" para jugar en grupo, presencial, en un solo
teléfono o tablet. Desarrollado para **Fargo Suministros** (distribuidor de
insumos de impresión) como pieza de marca para tienda/mostrador.

No requiere instalación, servidor ni build: es HTML/CSS/JS plano.

---

## 1. Cómo ejecutarlo

1. Descomprime la carpeta `cachiporra-app/` (mantén su estructura interna).
2. Abre `index.html` con doble clic, o arrástralo a cualquier navegador
   moderno (Chrome, Safari, Edge, Firefox).
3. Funciona sin conexión, salvo por la tipografía Poppins (se carga desde
   Google Fonts vía `<link>` en `index.html`; si no hay internet, el
   navegador usa la fuente del sistema como respaldo automático).
4. Pensado para **un solo dispositivo pasado de mano en mano** entre los
   jugadores — no es multijugador en red.

---

## 2. Estructura de carpetas

```
cachiporra-app/
├── index.html            # Documento raíz: enlaza CSS, assets y los 6 <script>
├── README.md              # Este archivo
├── css/
│   └── style.css          # Tokens de marca + todos los estilos de la app
├── js/
│   ├── constants.js        # Constantes con nombre (tamaños, enums, umbrales)
│   ├── engine.js           # Motor de reglas — lógica pura, sin DOM
│   ├── icons.js             # Biblioteca de iconos SVG inline (sin fotos/emoji)
│   ├── state.js             # Estado de la app + controlador (conecta motor y vista)
│   ├── render.js            # Vista — arma el DOM a partir del estado
│   └── main.js               # Arranque: dispara el primer render()
└── assets/
    ├── logo-fargo-suministros.png   # Logo horizontal real (a color, sin filtros)
    ├── favicon-32.png                # Isotipo circular — SOLO como ícono de pestaña
    └── favicon-64.png                # Idem, versión de mayor resolución
```

**Por qué está separado así:** `engine.js` no importa nada de `render.js` ni
toca el DOM — se puede probar o reemplazar sin tocar la interfaz. `state.js`
es el único archivo con variables mutables; `render.js` solo lee ese estado.
Los seis `<script>` se cargan en `index.html` en este orden porque cada uno
depende de que el anterior ya haya definido sus funciones/constantes
globales (no se usan módulos ES para que el archivo abra también con
doble clic, sin servidor local).

---

## 3. Reglas del juego (resumen)

1. Entre 2 y 10 jugadores. Cada uno, en privado, elige un número secreto del
   1 al 10 (los números **pueden repetirse** entre jugadores).
2. Por turnos, cada jugador tacha un número del tablero compartido (gesto de
   **arrastre**, no un simple toque).
3. Al tachar un número:
   - Si ya estaba tachado → no pasa nada, se ignora.
   - Si es tu propio número secreto → pierdes al instante ("quemaste la olla").
   - Si es el secreto de **un solo** jugador vivo (no tú) → ese jugador queda
     eliminado. Si con eso solo queda un jugador vivo, ese jugador pierde
     ("fue el último en pie").
   - Si es el secreto de **dos o más** jugadores vivos a la vez → pierde quien
     tachó (excepción: ver punto 4).
   - Si nadie vivo tiene ese número → no pasa nada, sigue el turno.
4. **Excepción — tablero agotado:** si el número que se va a tachar es el
   *último disponible* del tablero y lo comparten 2+ jugadores vivos, no se
   aplica la derrota automática del punto 3: se juega un **desempate real**
   solo entre esos jugadores, con un tablero nuevo desde cero. Si ese
   desempate vuelve a agotar el tablero con empate, se anida otro desempate,
   y así sucesivamente.
5. Quien pierde la partida debe pagar/invitar la apuesta acordada al inicio;
   todos los demás jugadores del partido (los que perdieron antes por
   eliminación incluidos) quedan "a salvo".

El detalle completo, con la trazabilidad de cada corrección aplicada durante
el diseño, está en `cachiporra-especificacion.md` y en el documento de
diseño del motor entregados previamente.

---

## 4. Arquitectura del motor (`engine.js`)

Función central: `resolveCross(session, number)`. Es **pura**: recibe una
sesión y un número, y devuelve `{ event, session }` sin mutar nada — no toca
`window`, `document` ni variables globales de estado.

Orden de evaluación (no es intercambiable — el orden es parte de la regla):

1. Número ya tachado → se ignora.
2. Último número del tablero + compartido por 2+ vivos → **desempate real**.
   *(Debe ir antes que el paso 5: si se evaluara después, nunca se
   alcanzaría.)*
3. Es tu propio secreto → quemaste la olla.
4. Secreto de exactamente un jugador vivo → eliminación (o fin de partida si
   era el penúltimo vivo).
5. Secreto de 2+ jugadores vivos (sin ser el caso 2) → pierdes tú.
6. Nadie lo tiene → sin efecto, sigue el turno.

El desempate del paso 2 se resuelve creando una **sesión nueva** con
`createSession()`, acotada a los jugadores involucrados — el mismo tipo de
sesión que la partida principal, así que reutiliza exactamente las mismas
reglas (no hay una versión especial del motor para desempates). Puede
anidarse tantas veces como haga falta.

Los "ganadores" (`Outcome.winnerIds`) siempre se calculan contra la lista
completa de jugadores del partido (`matchPlayers`, fijada en `state.js` al
iniciar), nunca contra el subconjunto de un desempate — porque el resultado
final de una sub-partida de desempate *es* el resultado final de todo el
partido.

---

## 5. Marca (`css/style.css`)

Tokens tomados literalmente de la guía de marca entregada:

| Token | Valor | Uso |
|---|---|---|
| `--fargo-blue-700` | `#0B4F8A` | Botones secundarios, acentos de texto |
| `--fargo-cyan` | `#00AEEF` | Borde superior de tarjetas por defecto |
| `--fargo-magenta` | `#EC008C` | Botón primario, acentos de derrota |
| `--fargo-yellow` | `#FFD400` | Acentos de alerta/tablero agotado |
| `--fargo-gray-100` | `#E6E6E6` | Fondo general (el mismo `theme-color` real del sitio) |

**Logo:** se muestra siempre en sus colores originales — el encabezado tiene
fondo blanco específicamente para que el logo (con azul, gris y los puntos
CMYK) se vea con buen contraste, sin ningún filtro CSS aplicado.

**Isotipo circular (`Suministros-Fargo-1.png`):** por pedido explícito, ya
**no aparece dentro de la aplicación**. Su único uso es como favicon (el
ícono que el navegador muestra en la pestaña), generado en dos tamaños
(`favicon-32.png`, `favicon-64.png`).

**Iconos:** toda la app usa iconos SVG dibujados a mano en `icons.js`
(`ICONS.inkDrop`, `ICONS.flame`, `ICONS.spotlight`, `ICONS.collidingDrops`,
`ICONS.handoff`, `ICONS.diceKey`, `ICONS.rematchLoop`, `ICONS.splat`,
`ICONS.shieldCheck`, `ICONS.betCup`, `ICONS.printer`, `ICONS.dragHint`) — sin
emojis ni fotografías, con la temática de tinta/impresión del isotipo
original ("gota que se transforma en F"). Cada pantalla del flujo tiene su
propio ícono ilustrativo.

---

## 6. Decisiones abiertas / pendientes

- **`DRAG_THRESHOLD_FRACTION`** (`js/constants.js`): se fijó en `0.6` de la
  diagonal de la celda como valor por defecto razonable; no estaba definido
  en la especificación original. Es la única constante que probablemente
  convenga ajustar tras probar el gesto en dispositivos reales.
- **Validación de nombres/apuesta vacíos:** si un jugador deja el nombre en
  blanco, se le asigna automáticamente "Jugador N"; la apuesta vacía se
  muestra como "lo que se haya acordado". Son valores por defecto de
  interfaz, no reglas del juego.
- **Reemplazo de iconos por imágenes tipo meme** (mencionado como posible
  mejora futura en la bitácora original): no se implementó porque requiere
  integrar un servicio externo de imágenes; los iconos SVG actuales cumplen
  el mismo propósito (nada de emojis) sin esa dependencia.

---

## 7. Cómo extender

- **Agregar una regla nueva:** se edita únicamente `js/engine.js`
  (`resolveCross`) — `render.js` no necesita cambios salvo que la regla
  requiera una pantalla nueva.
- **Cambiar el tema visual:** se edita solo `css/style.css` — todos los
  colores están centralizados en `:root` al inicio del archivo.
- **Agregar un ícono:** se agrega una función nueva al objeto `ICONS` en
  `js/icons.js` y se llama desde `render.js` donde haga falta.
