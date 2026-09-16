"use strict";
/* ============================================================================
   MOTOR DEL JUEGO (lógica pura)
   Implementa, en este orden, el resumen ejecutivo (sección 6 de la
   especificación / sección 4 del documento de diseño). No importa nada del
   DOM ni de render.js — solo recibe y devuelve datos planos.
   ========================================================================== */

function createSession(playerIds) {
  return {
    players: playerIds.map(id => ({ id, secretNumber: null, alive: true })),
    board: Array.from({ length: BOARD_SIZE }, (_, i) => ({ number: i + 1, crossedOut: false })),
    currentTurnIndex: 0,
    setupIndex: 0,
    stage: SESSION_STAGE.SETUP_PASS_DEVICE,
    history: [],
    outcome: { status: "PENDING", reason: null, loserId: null, winnerIds: [], pendingTiebreak: null }
  };
}

function cloneSession(session) {
  return JSON.parse(JSON.stringify(session));
}

function getCurrentPlayer(session) {
  return session.players[session.currentTurnIndex];
}

function getAlivePlayers(session) {
  return session.players.filter(p => p.alive);
}

function getPlayersWithSecret(session, number, { aliveOnly = false } = {}) {
  return session.players.filter(p => p.secretNumber === number && (!aliveOnly || p.alive));
}

// Único lugar que decide "a quién le toca ahora" (sección 3.2 de la especificación).
function getNextAliveIndex(session, fromIndex) {
  const n = session.players.length;
  for (let step = 1; step <= n; step++) {
    const idx = (fromIndex + step) % n;
    if (session.players[idx].alive) return idx;
  }
  return fromIndex;
}

function makeHistoryEntry(actorId, number, event, affectedPlayerIds) {
  return { actorId, numberCrossed: number, event, affectedPlayerIds };
}

// Los "ganadores" son SIEMPRE todos los demás jugadores del partido completo,
// no solo los del sub-tablero donde se resolvió (sección 3.6). matchPlayers
// es la lista global e inmutable creada en CONFIG (definida en state.js).
function buildOutcome(reason, loserId) {
  return {
    status: "RESOLVED",
    reason,
    loserId,
    winnerIds: matchPlayers.filter(p => p.id !== loserId).map(p => p.id),
    pendingTiebreak: null
  };
}

/**
 * resolveCross: función central del motor (sección 4 del documento de diseño).
 * Recibe la sesión activa y el número ya confirmado por gesto de arrastre.
 * Devuelve { event, session } — nunca muta la sesión recibida.
 */
function resolveCross(session, number) {
  const cell = session.board.find(c => c.number === number);

  // Regla 1 (resumen ejecutivo, punto 1): número ya tachado -> se ignora.
  if (cell.crossedOut) {
    return { event: ENGINE_EVENT.IGNORED_ALREADY_CROSSED, session };
  }

  const actor = getCurrentPlayer(session);
  const remainingBefore = session.board.filter(c => !c.crossedOut).length;
  const isLastAvailableNumber = remainingBefore === 1; // sección 3.4

  const aliveSharers = getPlayersWithSecret(session, number, { aliveOnly: true });

  // Regla 2 (sección 3.4/5.5): tablero agotado + 2+ jugadores vivos comparten
  // el número -> desempate real. DEBE evaluarse antes que la regla de empate
  // general (regla 5); ese orden es exactamente la corrección aplicada en 5.5.
  if (isLastAvailableNumber && aliveSharers.length >= 2) {
    const next = cloneSession(session);
    next.board.find(c => c.number === number).crossedOut = true;
    next.history.push(makeHistoryEntry(actor.id, number, ENGINE_EVENT.BOARD_TIEBREAK, aliveSharers.map(p => p.id)));
    next.outcome = {
      status: "PENDING",
      reason: null,
      loserId: null,
      winnerIds: [],
      pendingTiebreak: { involvedPlayerIds: aliveSharers.map(p => p.id), reasonForTiebreak: "BOARD_EXHAUSTED" }
    };
    return { event: ENGINE_EVENT.BOARD_TIEBREAK, session: next };
  }

  // Regla 3 (sección 3.3, primer caso): quema la olla.
  if (actor.secretNumber === number) {
    const next = cloneSession(session);
    next.board.find(c => c.number === number).crossedOut = true;
    next.history.push(makeHistoryEntry(actor.id, number, ENGINE_EVENT.GAME_OVER_BURN, [actor.id]));
    next.outcome = buildOutcome(LOSE_REASON.BURN, actor.id);
    return { event: ENGINE_EVENT.GAME_OVER_BURN, session: next };
  }

  const othersSharing = aliveSharers.filter(p => p.id !== actor.id);

  // Regla 4 (sección 3.3, tercer caso): secreto de exactamente un jugador vivo.
  if (othersSharing.length === 1) {
    const eliminatedId = othersSharing[0].id;
    const next = cloneSession(session);
    next.board.find(c => c.number === number).crossedOut = true;
    next.players.find(p => p.id === eliminatedId).alive = false;
    const aliveAfter = next.players.filter(p => p.alive);

    if (aliveAfter.length === 1) {
      next.history.push(makeHistoryEntry(actor.id, number, ENGINE_EVENT.GAME_OVER_ELIMINATION, [eliminatedId]));
      next.outcome = buildOutcome(LOSE_REASON.ELIMINATION, aliveAfter[0].id);
      return { event: ENGINE_EVENT.GAME_OVER_ELIMINATION, session: next };
    }
    next.history.push(makeHistoryEntry(actor.id, number, ENGINE_EVENT.ELIMINATED, [eliminatedId]));
    next.currentTurnIndex = getNextAliveIndex(next, next.currentTurnIndex);
    return { event: ENGINE_EVENT.ELIMINATED, session: next };
  }

  // Regla 5 (sección 3.3, cuarto caso / 3.5): secreto de 2+ vivos, sin ser el
  // caso de tablero agotado -> pierde quien tachó.
  if (othersSharing.length >= 2) {
    const next = cloneSession(session);
    next.board.find(c => c.number === number).crossedOut = true;
    next.history.push(makeHistoryEntry(actor.id, number, ENGINE_EVENT.GAME_OVER_TIE_LOSS, othersSharing.map(p => p.id)));
    next.outcome = buildOutcome(LOSE_REASON.TIE_LOSS, actor.id);
    return { event: ENGINE_EVENT.GAME_OVER_TIE_LOSS, session: next };
  }

  // Regla 6 (sección 3.3, segundo caso): nadie vivo tiene ese secreto.
  const next = cloneSession(session);
  next.board.find(c => c.number === number).crossedOut = true;
  next.history.push(makeHistoryEntry(actor.id, number, ENGINE_EVENT.NO_EFFECT, []));
  next.currentTurnIndex = getNextAliveIndex(next, next.currentTurnIndex);
  return { event: ENGINE_EVENT.NO_EFFECT, session: next };
}
