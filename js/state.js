"use strict";
/* ============================================================================
   ESTADO DE LA APLICACIÓN (controlador)
   Mantiene el estado mutable, llama al motor (engine.js) ante cada acción del
   usuario y dispara render() (render.js) para reflejar el resultado. Nunca
   decide reglas por su cuenta: eso es exclusivo de resolveCross().
   ========================================================================== */

let matchPlayers = [];      // [{id, name}] — fijo durante todo el partido
let bet = "";
let currentSession = null;
let appPhase = GAME_PHASE.CONFIG;
let tiebreakDepth = 0;
let matchOutcome = null;
let configDraft = { count: 4, names: ["", "", "", ""], bet: "" };

function playerName(id) {
  const p = matchPlayers.find(p => p.id === id);
  return p ? p.name : "?";
}

function startMatch(names, betText) {
  matchPlayers = names.map((name, i) => ({ id: "p" + i, name: name.trim() || ("Jugador " + (i + 1)) }));
  bet = betText.trim();
  currentSession = createSession(matchPlayers.map(p => p.id));
  tiebreakDepth = 0;
  matchOutcome = null;
  appPhase = GAME_PHASE.SESSION;
  render();
}

function handleContinuePassDevice() {
  currentSession.stage = SESSION_STAGE.SETUP_PICK_SECRET;
  render();
}

function handlePickSecret(number) {
  const idx = currentSession.setupIndex;
  currentSession.players[idx].secretNumber = number;
  currentSession.setupIndex++;
  if (currentSession.setupIndex >= currentSession.players.length) {
    currentSession.stage = SESSION_STAGE.PLAYING;
  } else {
    currentSession.stage = SESSION_STAGE.SETUP_PASS_DEVICE;
  }
  render();
}

function handleCrossConfirmed(number) {
  const { event, session } = resolveCross(currentSession, number);
  currentSession = session;

  if (event === ENGINE_EVENT.BOARD_TIEBREAK) {
    appPhase = GAME_PHASE.TIEBREAK_ANNOUNCE;
  } else if (
    event === ENGINE_EVENT.GAME_OVER_BURN ||
    event === ENGINE_EVENT.GAME_OVER_ELIMINATION ||
    event === ENGINE_EVENT.GAME_OVER_TIE_LOSS
  ) {
    matchOutcome = currentSession.outcome;
    appPhase = GAME_PHASE.GAME_OVER;
  }
  render();
}

function handleStartTiebreakRound() {
  const involvedIds = currentSession.outcome.pendingTiebreak.involvedPlayerIds;
  tiebreakDepth++;
  currentSession = createSession(involvedIds);
  appPhase = GAME_PHASE.SESSION;
  render();
}

function handleRestart() {
  matchPlayers = [];
  bet = "";
  currentSession = null;
  appPhase = GAME_PHASE.CONFIG;
  tiebreakDepth = 0;
  matchOutcome = null;
  configDraft = { count: 4, names: ["", "", "", ""], bet: "" };
  render();
}

function adjustPlayerCount(delta) {
  const next = configDraft.count + delta;
  if (next < MIN_PLAYERS || next > MAX_PLAYERS) return;
  configDraft.count = next;
  while (configDraft.names.length < next) configDraft.names.push("");
  configDraft.names.length = next;
  render();
}
