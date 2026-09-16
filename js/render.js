"use strict";
/* ============================================================================
   VISTA (renderizado)
   Cada función renderX() solo lee currentSession / matchOutcome / etc. y
   arma DOM. Ninguna función de aquí decide si algo gana, pierde o elimina:
   eso ya viene resuelto desde engine.js a través de state.js.
   ========================================================================== */

const app = document.getElementById("app");

function render() {
  app.innerHTML = "";
  if (appPhase === GAME_PHASE.CONFIG) return renderConfig();
  if (appPhase === GAME_PHASE.TIEBREAK_ANNOUNCE) return renderTiebreakAnnounce();
  if (appPhase === GAME_PHASE.GAME_OVER) return renderGameOver();

  // GAME_PHASE.SESSION -> depende de la etapa interna de la sesión
  if (currentSession.stage === SESSION_STAGE.SETUP_PASS_DEVICE) return renderPassDevice();
  if (currentSession.stage === SESSION_STAGE.SETUP_PICK_SECRET) return renderPickSecret();
  if (currentSession.stage === SESSION_STAGE.PLAYING) return renderPlaying();
}

function el(tag, className, html) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

function iconWrap(svgMarkup, className) {
  const wrap = el("span", className);
  wrap.innerHTML = svgMarkup;
  return wrap;
}

/* ---------- CONFIG ---------- */
function renderConfig() {
  const card = el("div", "card");
  card.appendChild(el("p", "eyebrow", "Antes de empezar"));
  card.appendChild(el("h1", "title", "Configura la partida"));
  card.appendChild(el("p", "body-text",
    "Elige cuántas personas juegan, sus nombres y qué debe invitar quien pierda La Cachiporra."));
  app.appendChild(card);

  const stepperCard = el("div", "card accent-magenta");
  const subtitle = el("h2", "subtitle");
  subtitle.appendChild(iconWrap(ICONS.printer("--fargo-blue-700")));
  subtitle.appendChild(document.createTextNode("Número de jugadores"));
  stepperCard.appendChild(subtitle);
  const stepper = el("div", "stepper");
  const minus = el("button", null, "−");
  const count = el("span", "count", String(configDraft.count));
  const plus = el("button", null, "+");
  minus.disabled = configDraft.count <= MIN_PLAYERS;
  plus.disabled = configDraft.count >= MAX_PLAYERS;
  minus.onclick = () => { adjustPlayerCount(-1); };
  plus.onclick = () => { adjustPlayerCount(1); };
  stepper.appendChild(minus);
  stepper.appendChild(count);
  stepper.appendChild(plus);
  stepperCard.appendChild(stepper);
  app.appendChild(stepperCard);

  const namesCard = el("div", "card accent-yellow");
  const namesTitle = el("h2", "subtitle");
  namesTitle.appendChild(iconWrap(ICONS.inkDrop("--fargo-magenta")));
  namesTitle.appendChild(document.createTextNode("Nombres"));
  namesCard.appendChild(namesTitle);
  const list = el("div", "name-list");
  for (let i = 0; i < configDraft.count; i++) {
    const field = el("div", "field");
    const label = el("label", null, "Jugador " + (i + 1));
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Nombre";
    input.value = configDraft.names[i] || "";
    input.maxLength = 20;
    input.oninput = (e) => { configDraft.names[i] = e.target.value; };
    field.appendChild(label);
    field.appendChild(input);
    list.appendChild(field);
  }
  namesCard.appendChild(list);
  app.appendChild(namesCard);

  const betCard = el("div", "card");
  const betTitle = el("h2", "subtitle");
  betTitle.appendChild(iconWrap(ICONS.betCup()));
  betTitle.appendChild(document.createTextNode("La apuesta de la tienda"));
  betCard.appendChild(betTitle);
  betCard.appendChild(el("p", "body-text", "Lo que debe invitar quien pierda."));
  const betField = el("div", "field");
  const betInput = document.createElement("input");
  betInput.type = "text";
  betInput.placeholder = "Ej: una ronda de gaseosas";
  betInput.value = configDraft.bet;
  betInput.oninput = (e) => { configDraft.bet = e.target.value; };
  betField.appendChild(betInput);
  betCard.appendChild(betField);
  app.appendChild(betCard);

  const startBtn = el("button", "btn btn-primary");
  startBtn.appendChild(iconWrap('<svg viewBox="0 0 24 24" style="fill:none" stroke="var(--fargo-white)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>'));
  startBtn.appendChild(document.createTextNode("Comenzar partida"));
  startBtn.onclick = () => {
    startMatch(configDraft.names.slice(0, configDraft.count), configDraft.bet);
  };
  app.appendChild(startBtn);
}

/* ---------- PASAR DISPOSITIVO ---------- */
function renderPassDevice() {
  const player = currentSession.players[currentSession.setupIndex];
  const card = el("div", "card accent-magenta");
  card.appendChild(el("p", "eyebrow", "Privacidad"));
  card.appendChild(el("div", "screen-visual", ICONS.handoff()));
  card.appendChild(el("h1", "title", "Pasa el dispositivo a " + escapeHtml(playerName(player.id))));
  card.appendChild(el("p", "body-text",
    "Nadie más debe ver la pantalla. Cuando " + escapeHtml(playerName(player.id)) +
    " tenga el dispositivo en sus manos, toca continuar."));
  app.appendChild(card);

  const btn = el("button", "btn btn-secondary");
  btn.appendChild(iconWrap(ICONS.inkDrop("--fargo-white")));
  btn.appendChild(document.createTextNode("Ya lo tengo, continuar"));
  btn.onclick = handleContinuePassDevice;
  app.appendChild(btn);
}

/* ---------- ELEGIR NÚMERO SECRETO ---------- */
function renderPickSecret() {
  const player = currentSession.players[currentSession.setupIndex];
  let selected = null;

  const card = el("div", "card");
  card.appendChild(el("p", "eyebrow", "Número secreto"));
  card.appendChild(el("div", "screen-visual", ICONS.diceKey()));
  card.appendChild(el("h1", "title", escapeHtml(playerName(player.id)) + ", elige tu número"));
  card.appendChild(el("p", "body-text", "Puede repetirse con el de otro jugador — eso es parte del juego."));
  app.appendChild(card);

  const keypadCard = el("div", "card accent-yellow");
  const keypad = el("div", "keypad");
  const buttons = [];
  for (let n = 1; n <= BOARD_SIZE; n++) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = String(n);
    b.onclick = () => {
      selected = n;
      buttons.forEach(x => x.classList.remove("selected"));
      b.classList.add("selected");
      confirmBtn.disabled = false;
    };
    buttons.push(b);
    keypad.appendChild(b);
  }
  keypadCard.appendChild(keypad);
  app.appendChild(keypadCard);

  const confirmBtn = el("button", "btn btn-primary", "Confirmar número");
  confirmBtn.disabled = true;
  confirmBtn.onclick = () => {
    if (selected !== null) handlePickSecret(selected);
  };
  app.appendChild(confirmBtn);
}

/* ---------- TABLERO / TACHADO ---------- */
function renderPlaying() {
  const actor = getCurrentPlayer(currentSession);

  const banner = el("div", "turn-banner");
  const whoWrap = el("div");
  const who = el("div", "who");
  who.appendChild(iconWrap(ICONS.inkDrop("--fargo-yellow")));
  who.appendChild(document.createTextNode("Turno de " + playerName(actor.id)));
  whoWrap.appendChild(who);
  whoWrap.appendChild(el("div", "hint", "Arrastra sobre un número para tacharlo"));
  banner.appendChild(whoWrap);
  banner.appendChild(iconWrap(ICONS.dragHint()));
  app.appendChild(banner);

  const boardCard = el("div", "card accent-magenta");
  const grid = el("div", "board-grid");
  currentSession.board.forEach(cell => {
    grid.appendChild(buildBoardCell(cell));
  });
  boardCard.appendChild(grid);
  app.appendChild(boardCard);

  const handsWrap = el("div", "card");
  const handsTitle = el("h2", "subtitle");
  handsTitle.appendChild(iconWrap(ICONS.printer("--fargo-blue-700")));
  handsTitle.appendChild(document.createTextNode("Jugadores"));
  handsWrap.appendChild(handsTitle);
  const hands = el("div", "hands-row");
  currentSession.players.forEach(p => {
    hands.appendChild(buildHandCard(p, p.id === actor.id));
  });
  handsWrap.appendChild(hands);
  app.appendChild(handsWrap);

  const lastMove = currentSession.history[currentSession.history.length - 1];
  const historyBox = el("div", "history-box");
  historyBox.appendChild(iconWrap(ICONS.inkDrop("--fargo-blue-500")));
  historyBox.appendChild(el("span", null, describeHistoryEntry(lastMove)));
  app.appendChild(historyBox);
}

function buildHandCard(player, isCurrentTurn) {
  const card = el("div", "hand-card" + (player.alive ? "" : " eliminated") + (isCurrentTurn && player.alive ? " current-turn" : ""));
  const icon = el("div", "hand-icon");
  icon.innerHTML = player.alive ? ICONS.inkDrop("--fargo-blue-700") : ICONS.splat();
  card.appendChild(icon);
  card.appendChild(el("div", "hand-name", escapeHtml(playerName(player.id))));
  return card;
}

function describeHistoryEntry(entry) {
  if (!entry) return "Toca un número y arrástralo para empezar a tachar.";
  const actor = "<strong>" + escapeHtml(playerName(entry.actorId)) + "</strong>";
  switch (entry.event) {
    case ENGINE_EVENT.NO_EFFECT:
      return actor + " tachó el " + entry.numberCrossed + " — sin efecto.";
    case ENGINE_EVENT.ELIMINATED:
      return actor + " tachó el " + entry.numberCrossed + " y eliminó a <strong>" +
        escapeHtml(playerName(entry.affectedPlayerIds[0])) + "</strong>.";
    default:
      return actor + " tachó el " + entry.numberCrossed + ".";
  }
}

// ---- gesto de arrastre para tachar (DRAG_THRESHOLD_FRACTION) ----
function buildBoardCell(cell) {
  const div = el("div", "board-cell" + (cell.crossedOut ? " crossed" : ""), String(cell.number));
  const strike = el("div", "strike");
  div.appendChild(strike);

  if (cell.crossedOut) return div;

  let dragging = false;
  let startX = 0, startY = 0;

  const getThresholdPx = () => {
    const rect = div.getBoundingClientRect();
    const diagonal = Math.hypot(rect.width, rect.height);
    return diagonal * DRAG_THRESHOLD_FRACTION;
  };

  const onMove = (clientX, clientY) => {
    if (!dragging) return;
    const dist = Math.hypot(clientX - startX, clientY - startY);
    const pct = Math.min(100, (dist / getThresholdPx()) * 100);
    strike.style.width = pct + "%";
    strike.style.background = "var(--fargo-magenta)";
  };

  const finishDrag = (clientX, clientY) => {
    if (!dragging) return;
    dragging = false;
    const dist = Math.hypot(clientX - startX, clientY - startY);
    if (dist >= getThresholdPx()) {
      handleCrossConfirmed(cell.number); // re-renderiza todo el tablero
    } else {
      strike.style.width = "0%";
    }
  };

  div.addEventListener("pointerdown", (e) => {
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    div.setPointerCapture(e.pointerId);
  });
  div.addEventListener("pointermove", (e) => onMove(e.clientX, e.clientY));
  div.addEventListener("pointerup", (e) => finishDrag(e.clientX, e.clientY));
  div.addEventListener("pointercancel", () => { dragging = false; strike.style.width = "0%"; });

  return div;
}

/* ---------- ANUNCIO DE DESEMPATE (tablero agotado, sección 3.4) ---------- */
function renderTiebreakAnnounce() {
  const info = currentSession.outcome.pendingTiebreak;
  const names = info.involvedPlayerIds.map(id => playerName(id));

  const card = el("div", "card accent-yellow");
  card.appendChild(el("p", "eyebrow", "El tablero se agotó"));
  card.appendChild(el("div", "screen-visual", ICONS.rematchLoop()));
  card.appendChild(el("h1", "title", "Hace falta un desempate real"));
  card.appendChild(el("p", "body-text",
    "El último número disponible del tablero era el secreto de más de un jugador a la vez. " +
    "Nadie tuvo otra jugada posible, así que no cuenta como derrota automática: " +
    names.map(escapeHtml).join(", ") +
    " van a jugar una ronda nueva, solo entre ustedes, con su propio tablero."));
  app.appendChild(card);

  const btn = el("button", "btn btn-secondary");
  btn.appendChild(iconWrap(ICONS.rematchLoop()));
  btn.appendChild(document.createTextNode("Iniciar desempate"));
  btn.onclick = handleStartTiebreakRound;
  app.appendChild(btn);
}

/* ---------- PANTALLA FINAL (tres variantes, sección 4/5.7) ---------- */
function renderGameOver() {
  const loserName = playerName(matchOutcome.loserId);
  const winnerNames = matchOutcome.winnerIds.map(playerName);

  let accentClass = "accent-magenta";
  let title = "";
  let explanation = "";
  let visualSvg = "";

  if (matchOutcome.reason === LOSE_REASON.BURN) {
    accentClass = "accent-magenta";
    title = escapeHtml(loserName) + " quemó la olla";
    explanation = "Tachó su propio número secreto — pierde al instante, sin importar cuántos jugadores seguían en pie.";
    visualSvg = ICONS.flame();
  } else if (matchOutcome.reason === LOSE_REASON.ELIMINATION) {
    accentClass = "accent-yellow";
    title = escapeHtml(loserName) + " fue el último en pie";
    explanation = "En La Cachiporra sobrevivir hasta el final es la condición de derrota, no de victoria.";
    visualSvg = ICONS.spotlight();
  } else if (matchOutcome.reason === LOSE_REASON.TIE_LOSS) {
    // 5.7 punto 2: el título nunca usa la palabra "empate" para anunciar la derrota.
    accentClass = "accent-magenta";
    title = escapeHtml(loserName) + " pierde la cachiporra";
    explanation = "El número que tachó era el secreto de más de un jugador a la vez. " +
      "Un solo tachón no se puede repartir entre dos personas, así que la responsabilidad " +
      "es de quien decidió tachar ese número.";
    visualSvg = ICONS.collidingDrops();
  }

  const card = el("div", "card " + accentClass);
  card.appendChild(el("div", "screen-visual", visualSvg));
  card.appendChild(el("h1", "title final-title", title));
  card.appendChild(el("p", "body-text", explanation));
  app.appendChild(card);

  const betCard = el("div", "bet-box");
  betCard.appendChild(iconWrap(ICONS.betCup()));
  betCard.appendChild(document.createTextNode("Le toca invitar: " + (bet || "lo que se haya acordado")));
  app.appendChild(betCard);

  const winnersCard = el("div", "card");
  const winnersTitle = el("h2", "subtitle");
  winnersTitle.appendChild(iconWrap(ICONS.shieldCheck()));
  winnersTitle.appendChild(document.createTextNode("A salvo"));
  winnersCard.appendChild(winnersTitle);
  const list = el("div", "winners-list");
  winnerNames.forEach(n => {
    const chip = el("span");
    chip.innerHTML = ICONS.shieldCheck("--fargo-blue-500");
    chip.appendChild(document.createTextNode(" " + n));
    list.appendChild(chip);
  });
  winnersCard.appendChild(list);
  app.appendChild(winnersCard);

  const restartBtn = el("button", "btn btn-secondary");
  restartBtn.appendChild(iconWrap(ICONS.rematchLoop()));
  restartBtn.appendChild(document.createTextNode("Jugar otra vez"));
  restartBtn.onclick = handleRestart;
  app.appendChild(restartBtn);
}

/* ---------- utilidades de vista ---------- */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
