"use strict";
/* ============================================================================
   ICONOS SVG (creativos, temática de tinta/impresión — coherente con el
   isotipo de "gota que se transforma en F" de la guía de marca). Se generan
   como texto para insertarlos con innerHTML; usan currentColor o variables
   CSS de marca para heredar color según dónde se coloquen.
   ========================================================================== */

const ICONS = {

  // Gota de tinta — usada como "secreto oculto" en las manos boca abajo y
  // como acento decorativo junto al nombre del juego.
  inkDrop(colorVar = "--fargo-white") {
    return `<svg viewBox="0 0 24 24" style="fill:var(${colorVar})">
      <path d="M12 2C9 7 5 11.2 5 15.2 5 19.5 8.1 22 12 22s7-2.5 7-6.8C19 11.2 15 7 12 2z"/>
      <ellipse cx="9.6" cy="14.5" rx="1.5" ry="2.2" fill="rgba(255,255,255,0.35)"/>
    </svg>`;
  },

  // Salpicón de tinta / cartucho roto — jugador eliminado.
  splat(colorVar = "--fargo-danger") {
    return `<svg viewBox="0 0 24 24" style="fill:var(${colorVar})">
      <path d="M12 3c1 2 3 2.6 4.4 4 1.6 1.6 2.6 3.3 2.1 5.4-.6 2.6-3.2 4.2-5.6 3.7-.6 2-2.6 3.4-4.7 2.9-2.3-.5-3.6-2.9-2.8-5.1.2-.6.6-1.1.5-1.7-1.6-.2-2.9-1.6-2.7-3.3.2-1.8 2-2.9 3.7-2.4.4-1.6 1.9-2.8 3.6-2.7.5 0 1 .1 1.5-.8z"/>
    </svg>`;
  },

  // Dos manos pasando el teléfono — pantalla "pasa el dispositivo".
  handoff() {
    return `<svg viewBox="0 0 120 120">
      <rect x="14" y="34" width="40" height="60" rx="10" style="fill:var(--fargo-cyan)" transform="rotate(-8 34 64)"/>
      <rect x="66" y="26" width="40" height="60" rx="10" style="fill:var(--fargo-magenta)" transform="rotate(8 86 56)"/>
      <circle cx="60" cy="60" r="9" style="fill:var(--fargo-yellow)"/>
      <path d="M40 60 L80 60" stroke="var(--fargo-key)" stroke-width="3" stroke-dasharray="4 5" fill="none"/>
    </svg>`;
  },

  // Dado / teclado numérico — pantalla "elige tu número secreto".
  diceKey() {
    return `<svg viewBox="0 0 120 120">
      <rect x="18" y="18" width="84" height="84" rx="18" style="fill:var(--fargo-blue-700)"/>
      <circle cx="42" cy="42" r="7" style="fill:var(--fargo-cyan)"/>
      <circle cx="78" cy="42" r="7" style="fill:var(--fargo-magenta)"/>
      <circle cx="60" cy="60" r="7" style="fill:var(--fargo-yellow)"/>
      <circle cx="42" cy="78" r="7" style="fill:var(--fargo-white)"/>
      <circle cx="78" cy="78" r="7" style="fill:var(--fargo-cyan)"/>
    </svg>`;
  },

  // Impresora simplificada — acento de marca (encabezado / pie de página).
  printer(colorVar = "--fargo-blue-700") {
    return `<svg viewBox="0 0 24 24" style="fill:var(${colorVar})">
      <path d="M6 8V3h12v5h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2v3H6v-3H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h2zm2-3v3h8V5H8zm0 11v3h8v-3H8zm-2.5-3.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
    </svg>`;
  },

  // Flama en tonos CMYK — "quemó la olla".
  flame() {
    return `<svg viewBox="0 0 120 120">
      <path d="M60 14c8 14-6 20-6 32 0 8 6 12 12 10 10-3 12-14 8-22 14 8 20 24 14 38-7 16-26 24-42 17S22 66 30 50c5-10 14-16 18-26 4-9 8-10 12-10z" style="fill:var(--fargo-magenta)"/>
      <path d="M62 46c4 8-2 12-2 19 0 6 5 9 9 7 7-2 9-10 6-16 9 6 13 17 9 27-5 11-18 16-29 12s-16-16-11-27c3-6 9-10 12-16 2-5 4-6 6-6z" style="fill:var(--fargo-yellow)"/>
    </svg>`;
  },

  // Un solo foco / reflector — "el último en pie" (sobrevivir es perder).
  spotlight() {
    return `<svg viewBox="0 0 120 120">
      <g stroke="var(--fargo-yellow)" stroke-width="4" stroke-linecap="round">
        <line x1="60" y1="8" x2="60" y2="22"/>
        <line x1="60" y1="98" x2="60" y2="112"/>
        <line x1="8" y1="60" x2="22" y2="60"/>
        <line x1="98" y1="60" x2="112" y2="60"/>
        <line x1="24" y1="24" x2="34" y2="34"/>
        <line x1="86" y1="86" x2="96" y2="96"/>
        <line x1="96" y1="24" x2="86" y2="34"/>
        <line x1="34" y1="86" x2="24" y2="96"/>
      </g>
      <circle cx="60" cy="60" r="26" style="fill:var(--fargo-blue-700)"/>
      <circle cx="60" cy="60" r="10" style="fill:var(--fargo-white)"/>
    </svg>`;
  },

  // Dos gotas que chocan y se anulan — derrota por número compartido.
  collidingDrops() {
    return `<svg viewBox="0 0 120 120">
      <path d="M44 20c6 10-4 15-4 24 0 7 5 11 11 9 8-2 10-12 6-19 11 6 15 19 9 29-6 10-19 13-28 7s-12-19-6-29c3-6 8-13 12-21z" style="fill:var(--fargo-cyan)"/>
      <path d="M78 40c6 10-4 15-4 24 0 7 5 11 11 9 8-2 10-12 6-19 11 6 15 19 9 29-6 10-19 13-28 7s-12-19-6-29c3-6 8-13 12-21z" style="fill:var(--fargo-magenta)"/>
      <line x1="26" y1="96" x2="98" y2="30" stroke="var(--fargo-key)" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
  },

  // Flechas en bucle — anuncio de desempate / revancha.
  rematchLoop() {
    return `<svg viewBox="0 0 120 120">
      <path d="M30 60a30 30 0 0 1 50-22" fill="none" stroke="var(--fargo-blue-700)" stroke-width="7" stroke-linecap="round"/>
      <path d="M90 60a30 30 0 0 1-50 22" fill="none" stroke="var(--fargo-magenta)" stroke-width="7" stroke-linecap="round"/>
      <path d="M78 30l10 8-12 4z" style="fill:var(--fargo-blue-700)"/>
      <path d="M42 90l-10-8 12-4z" style="fill:var(--fargo-magenta)"/>
      <circle cx="60" cy="60" r="10" style="fill:var(--fargo-yellow)"/>
    </svg>`;
  },

  // Escudo con check — chip de "a salvo" para ganadores.
  shieldCheck(colorVar = "--fargo-blue-700") {
    return `<svg viewBox="0 0 24 24" style="fill:${colorVar.startsWith('--') ? 'var(' + colorVar + ')' : colorVar}">
      <path d="M12 2l8 3.5v6c0 5-3.4 8.9-8 10.5-4.6-1.6-8-5.5-8-10.5v-6L12 2z"/>
      <path d="M9.8 12.6l1.7 1.7 3.2-4" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  },

  // Moneda / vaso — chip de la apuesta.
  betCup() {
    return `<svg viewBox="0 0 24 24" style="fill:var(--fargo-key)">
      <path d="M6 3h12l-1.2 12.2A4 4 0 0 1 12.8 19h-1.6a4 4 0 0 1-4-3.8L6 3z"/>
      <path d="M4 3h16" stroke="var(--fargo-key)" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M9 21h6" stroke="var(--fargo-key)" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M12 19v2" stroke="var(--fargo-key)" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`;
  },

  // Cursor de arrastre — pista de interacción en el tablero.
  dragHint() {
    return `<svg viewBox="0 0 24 24" style="fill:none" stroke="var(--fargo-white)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 12h9"/>
      <path d="M12 8l4 4-4 4"/>
    </svg>`;
  }
};
