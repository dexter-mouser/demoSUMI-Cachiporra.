"use strict";
/* ============================================================================
   CONSTANTES CON NOMBRE
   Documento de diseño, sección 1 — reemplaza los literales sueltos que se
   habían acumulado en el código anterior (9, 10, 0.7, 0.75...).
   ========================================================================== */

const BOARD_SIZE = 10;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;

// Fracción de la diagonal de la celda que hay que arrastrar para que cuente
// como "tachado" (gesto de arrastre, no un toque). Quedaba como número mágico
// sin resolver en la bitácora (0.7 / 0.75); se fija aquí en 0.6, documentado
// y fácil de ajustar en un solo lugar.
const DRAG_THRESHOLD_FRACTION = 0.6;

const GAME_PHASE = {
  CONFIG: "CONFIG",
  SESSION: "SESSION",
  TIEBREAK_ANNOUNCE: "TIEBREAK_ANNOUNCE",
  GAME_OVER: "GAME_OVER"
};

const SESSION_STAGE = {
  SETUP_PASS_DEVICE: "SETUP_PASS_DEVICE",
  SETUP_PICK_SECRET: "SETUP_PICK_SECRET",
  PLAYING: "PLAYING"
};

const ENGINE_EVENT = {
  IGNORED_ALREADY_CROSSED: "IGNORED_ALREADY_CROSSED",
  NO_EFFECT: "NO_EFFECT",
  ELIMINATED: "ELIMINATED",
  GAME_OVER_BURN: "GAME_OVER_BURN",
  GAME_OVER_ELIMINATION: "GAME_OVER_ELIMINATION",
  GAME_OVER_TIE_LOSS: "GAME_OVER_TIE_LOSS",
  BOARD_TIEBREAK: "BOARD_TIEBREAK"
};

const LOSE_REASON = {
  BURN: "BURN",
  ELIMINATION: "ELIMINATION",
  TIE_LOSS: "TIE_LOSS"
};
