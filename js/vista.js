// Vista — arma el DOM a partir del estado.
const escapar = texto => String(texto).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const ilustracion = (icono, tono = '') => `<div class="screen-visual ${tono}">${icono()}</div>`;

function pantallaConfiguracion(){
  const campos = Array.from({ length: estado.cantidad }, (_, i) =>
    `<div class="field"><label>Jugador ${i + 1}</label>
     <input type="text" maxlength="16" data-indice="${i}" placeholder="Jugador ${i + 1}" value="${escapar(estado.nombres[i] || '')}"></div>`).join('');
  return `<section class="card stack">
    <div><p class="eyebrow">Juego de mostrador</p><h1 class="title">SumiPorra</h1></div>
    <p class="body-text">Pasen el dispositivo de mano en mano. Cada quien elige un número secreto y, por turnos, tachan números del tablero. ¡Que no te toque el tuyo!</p>
    <div class="stepper">
      <button data-accion="menos" ${estado.cantidad <= JUGADORES_MIN ? 'disabled' : ''} aria-label="Menos jugadores">−</button>
      <div class="count">${estado.cantidad}</div>
      <button data-accion="mas" ${estado.cantidad >= JUGADORES_MAX ? 'disabled' : ''} aria-label="Más jugadores">+</button>
    </div>
    <div class="name-list">${campos}</div>
    <div class="field"><label>Apuesta (¿qué se juegan?)</label>
      <input type="text" maxlength="40" data-apuesta placeholder="Ej: los cafés" value="${escapar(estado.apuesta)}"></div>
    <button class="btn btn-primary" data-accion="iniciar">${ICONOS.gotaTinta()} Empezar</button>
  </section>`;
}
function pantallaRelevo(){
  const jugador = estado.sesion.jugadores[estado.indiceElegir];
  return `<section class="card stack">
    ${ilustracion(ICONOS.relevo, 'blue')}
    <p class="body-text center">Pasa el dispositivo a</p>
    <div class="big-name">${escapar(jugador.nombre)}</div>
    <p class="body-text center">Nadie más debe mirar la pantalla.</p>
    <button class="btn btn-secondary" data-accion="relevo">${ICONOS.escudo()} Soy ${escapar(jugador.nombre)}</button>
  </section>`;
}
function pantallaElegir(){
  const jugador = estado.sesion.jugadores[estado.indiceElegir];
  const teclas = Array.from({ length: TAMANO_TABLERO }, (_, i) => i + 1).map(n =>
    `<button data-accion="elegir" data-numero="${n}" class="${estado.valorElegido === n ? 'selected' : ''}">${n}</button>`).join('');
  return `<section class="card stack">
    <div><p class="eyebrow">${escapar(jugador.nombre)}</p><h2 class="subtitle">${ICONOS.escudo()} Elige tu número secreto</h2></div>
    <div class="keypad">${teclas}</div>
    <button class="btn btn-primary" data-accion="secreto" ${estado.valorElegido ? '' : 'disabled'}>Guardar en secreto</button>
  </section>`;
}
function textoEvento(evento){
  if (!evento) return 'Toca un número para resaltarlo.';
  if (evento.tipo === TipoEvento.NADA) return `<strong>${escapar(nombrePorId(evento.idAutor))}</strong> tachó el ${evento.numero}: nadie lo tenía.`;
  if (evento.tipo === TipoEvento.ELIMINADO) return `<strong>${escapar(nombrePorId(evento.idAutor))}</strong> tachó el ${evento.numero} y eliminó a <strong>${escapar(nombrePorId(evento.idVictima))}</strong>.`;
  return '';
}
function pantallaJuego(){
  const sesion = estado.sesion, actual = sesion.jugadores[sesion.turno];
  const celdas = Array.from({ length: TAMANO_TABLERO }, (_, i) => i + 1).map(n => {
    const tachada = sesion.tachados.includes(n), resaltada = estado.seleccionado === n;
    return `<button class="board-cell ${tachada ? 'crossed' : ''} ${resaltada ? 'selected' : ''}" data-accion="celda" data-numero="${n}" ${tachada ? 'disabled' : ''}>${n}<span class="strike"></span></button>`;
  }).join('');
  const manos = sesion.jugadores.map((j, i) => `<div class="hand-card ${j.vivo ? '' : 'eliminated'} ${i === sesion.turno ? 'current-turn' : ''}">
      <div class="hand-icon">${j.vivo ? ICONOS.gotaTinta() : ICONOS.salpicadura()}</div><div class="hand-name">${escapar(j.nombre)}</div></div>`).join('');
  return `<div class="turn-banner"><div><div class="who">${ICONOS.diana()} Turno de ${escapar(actual.nombre)}</div>
      <div class="hint">Toca un número y vuelve a tocarlo para confirmar</div></div></div>
    <div class="board-grid">${celdas}</div>
    <div class="hands-row">${manos}</div>
    <div class="history-box">${ICONOS.llama()}<span>${textoEvento(estado.ultimoEvento)}</span></div>`;
}
function pantallaDesempate(){
  const evento = estado.ultimoEvento, nombres = evento.idsPoseedores.map(id => escapar(nombrePorId(id))).join(', ');
  return `<section class="card accent-yellow stack">
    ${ilustracion(ICONOS.llama, 'blue')}
    <h1 class="title center">¡Tablero agotado!</h1>
    <p class="body-text center">El último número (${evento.numero}) lo compartían: <strong>${nombres}</strong>. Se juega un desempate solo entre ellos, con un tablero nuevo. Cada uno elige un nuevo número secreto.</p>
    <button class="btn btn-primary" data-accion="desempate">${ICONOS.revancha()} Empezar desempate</button>
  </section>`;
}
function pantallaFinal(){
  const evento = estado.ultimoEvento, perdedor = nombrePorId(estado.idPerdedor);
  const motivo = evento.tipo === TipoEvento.QUEMADO ? `Tachó su propio número (${evento.numero}): ¡quemó la olla!`
    : evento.tipo === TipoEvento.COMPARTIDO ? `Tachó el ${evento.numero}, que tenían varios jugadores.`
    : `Fue el último en pie tras eliminar a ${escapar(nombrePorId(evento.idVictima))}.`;
  const salvados = estado.jugadoresPartida.filter(j => j.id !== estado.idPerdedor)
    .map(j => `<span>${ICONOS.escudo()} ${escapar(j.nombre)}</span>`).join('');
  return `<section class="card accent-magenta stack">
    ${ilustracion(ICONOS.salpicadura, 'magenta')}
    <p class="eyebrow center">Perdió</p>
    <h1 class="title final-title">${escapar(perdedor)}</h1>
    <p class="body-text center">${motivo}</p>
    <div class="bet-box">${ICONOS.copaApuesta()} ${escapar(estado.apuesta.trim() || 'lo que se haya acordado')}</div>
    <p class="eyebrow center">A salvo</p><div class="winners-list">${salvados}</div>
    <button class="btn btn-primary" data-accion="denuevo">${ICONOS.revancha()} Jugar de nuevo</button>
  </section>`;
}
function htmlAviso(){
  if (estado.pantalla !== Pantalla.JUEGO || estado.seleccionado === null) return '';
  return `<div class="toast" role="status"><span>Toca de nuevo el <b>${estado.seleccionado}</b> para confirmar</span>
    <button data-accion="cancelar">Cancelar</button></div>`;
}
function htmlAyuda(){
  if (!estado.ayudaAbierta) return '';
  return `<div class="modal" data-accion="ayuda-fondo"><div class="card" role="dialog" aria-label="Cómo jugar">
    <button class="icon-btn close" data-accion="ayuda-cerrar" aria-label="Cerrar">${ICONOS.cerrar()}</button>
    <h2 class="subtitle">${ICONOS.ayuda()} Cómo jugar</h2>
    <ol class="rules">
      <li>Juegan de <strong>2 a 10</strong> personas con un solo dispositivo.</li>
      <li>Cada quien elige en secreto un número del <strong>1 al 10</strong> (se pueden repetir).</li>
      <li>Por turnos, toca un número del tablero para <strong>resaltarlo</strong> y tócalo <strong>otra vez para confirmar</strong>.</li>
      <li>Si tachas <strong>tu propio número</strong>, pierdes.</li>
      <li>Si tachas el número de <strong>un solo jugador</strong>, queda eliminado. Si solo queda uno vivo, ese pierde.</li>
      <li>Si tachas un número de <strong>dos o más jugadores</strong>, pierdes tú.</li>
      <li>Si nadie lo tiene, no pasa nada y sigue el siguiente turno.</li>
      <li>Si el <strong>último número</strong> lo comparten varios, hay desempate entre ellos.</li>
      <li>Quien pierde paga la apuesta acordada.</li>
    </ol>
    <button class="btn btn-secondary" data-accion="ayuda-cerrar">Entendido</button>
  </div></div>`;
}
function renderizar(){
  const pantallas = { [Pantalla.CONFIGURACION]:pantallaConfiguracion, [Pantalla.RELEVO]:pantallaRelevo, [Pantalla.ELEGIR]:pantallaElegir,
    [Pantalla.JUEGO]:pantallaJuego, [Pantalla.DESEMPATE]:pantallaDesempate, [Pantalla.FINAL]:pantallaFinal };
  document.getElementById('app').innerHTML = pantallas[estado.pantalla]();
  document.getElementById('raiz-aviso').innerHTML = htmlAviso();
  document.getElementById('raiz-modal').innerHTML = htmlAyuda();
  window.scrollTo(0, 0);
}
