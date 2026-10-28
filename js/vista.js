// Vista — arma el DOM a partir del estado.
const escapar = texto => String(texto).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const ilustracion = (icono, tono = '') => `<div class="ilustracion ${tono}">${icono()}</div>`;
const numerosDelTablero = () => Array.from({ length: estado.sesion.tamano }, (_, i) => i + 1);

function selector(valor, accionMenos, accionMas, desactivarMenos, desactivarMas, etiqueta){
  return `<div class="selector"><button data-accion="${accionMenos}" ${desactivarMenos ? 'disabled' : ''} aria-label="Menos ${etiqueta}">−</button>
    <div class="contador">${valor}</div>
    <button data-accion="${accionMas}" ${desactivarMas ? 'disabled' : ''} aria-label="Más ${etiqueta}">+</button></div>`;
}
function pantallaInicio(){
  return `<section class="inicio">
    <div class="heroe"><span class="bola b0">3</span><span class="bola b1">7</span><span class="bola b2">10</span></div>
    <h1 class="titulo-inicio">Sumi<span>Porra</span></h1>
    <p class="lema">Elige tu número en secreto. Tacha con cuidado. ¡Que no te toque el tuyo!</p>
    <button class="btn btn-primario" data-accion="jugar">${ICONOS.jugar()} Jugar</button>
    <button class="btn btn-claro" data-accion="ayuda">${ICONOS.ayuda()} Cómo jugar</button>
  </section>`;
}
function pantallaConfiguracion(){
  const campos = Array.from({ length: estado.cantidad }, (_, i) =>
    `<input type="text" maxlength="16" data-indice="${i}" placeholder="Jugador ${i + 1}" value="${escapar(estado.nombres[i] || '')}">`).join('');
  const fichas = PREMIOS.map((p, i) => `<button class="ficha-premio ${estado.premioIndice === i ? 'activo' : ''}" data-accion="premio" data-premio="${i}">${escapar(p)}</button>`).join('')
    + `<button class="ficha-premio ${estado.premioIndice === PREMIO_PERSONALIZADO ? 'activo' : ''}" data-accion="premio" data-premio="${PREMIO_PERSONALIZADO}">✎ Personalizado</button>`;
  const personalizado = estado.premioIndice === PREMIO_PERSONALIZADO
    ? `<input type="text" maxlength="40" data-premio-texto placeholder="Escribe tu premio" value="${escapar(estado.premioTexto)}">` : '';
  return `<section class="tarjeta pila">
    <h2 class="titulo">Prepara la partida</h2>
    <div><p class="sobretitulo">Jugadores</p>${selector(estado.cantidad, 'menos', 'mas', estado.cantidad <= JUGADORES_MIN, estado.cantidad >= JUGADORES_MAX, 'jugadores')}</div>
    <div class="lista-nombres">${campos}</div>
    <div><p class="sobretitulo">Números del 1 al…</p>${selector(estado.rango, 'rango-menos', 'rango-mas', estado.rango <= RANGO_MIN, estado.rango >= RANGO_MAX, 'números')}</div>
    <div><p class="sobretitulo">Premio para quien pierda</p><div class="premios">${fichas}</div>${personalizado}</div>
    <button class="btn btn-primario" data-accion="iniciar">${ICONOS.gotaTinta()} Empezar</button>
  </section>`;
}
function pantallaRelevo(){
  const jugador = estado.sesion.jugadores[estado.indiceElegir];
  return `<section class="tarjeta pila">
    ${ilustracion(ICONOS.relevo, 'azul')}
    <p class="texto centro">Pasa el dispositivo a</p>
    <div class="nombre-grande">${escapar(jugador.nombre)}</div>
    <p class="texto centro">Nadie más debe mirar la pantalla.</p>
    <button class="btn btn-secundario" data-accion="relevo">${ICONOS.escudo()} Soy ${escapar(jugador.nombre)}</button>
  </section>`;
}
function pantallaElegir(){
  const jugador = estado.sesion.jugadores[estado.indiceElegir];
  const teclas = numerosDelTablero().map(n =>
    `<button data-accion="elegir" data-numero="${n}" class="${estado.valorElegido === n ? 'elegido' : ''}">${n}</button>`).join('');
  return `<section class="tarjeta pila">
    <div><p class="sobretitulo">${escapar(jugador.nombre)}</p><h2 class="titulo">Elige tu número secreto</h2></div>
    <div class="teclado">${teclas}</div>
    <button class="btn btn-primario" data-accion="secreto" ${estado.valorElegido ? '' : 'disabled'}>${ICONOS.escudo()} Guardar en secreto</button>
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
  const celdas = numerosDelTablero().map(n => {
    const tachada = sesion.tachados.includes(n), resaltada = estado.seleccionado === n;
    return `<button class="celda color-${n % 3} ${tachada ? 'tachada' : ''} ${resaltada ? 'resaltada' : ''}" data-accion="celda" data-numero="${n}" ${tachada ? 'disabled' : ''}>${n}</button>`;
  }).join('');
  const fichas = sesion.jugadores.map((j, i) => `<div class="ficha ${j.vivo ? '' : 'eliminada'} ${i === sesion.turno ? 'turno-actual' : ''}">
      <div class="ficha-icono">${j.vivo ? escapar(j.nombre.charAt(0).toUpperCase()) : ICONOS.salpicadura()}</div><div class="ficha-nombre">${escapar(j.nombre)}</div></div>`).join('');
  return `<div class="banner-turno"><div class="quien">${ICONOS.diana()} Turno de ${escapar(actual.nombre)}</div>
      <div class="pista">Toca un número y vuelve a tocarlo para confirmar</div></div>
    <div class="tablero">${celdas}</div>
    <div class="fichas">${fichas}</div>
    <div class="historial">${ICONOS.llama()}<span>${textoEvento(estado.ultimoEvento)}</span></div>`;
}
function pantallaDesempate(){
  const evento = estado.ultimoEvento, nombres = evento.idsPoseedores.map(id => escapar(nombrePorId(id))).join(', ');
  return `<section class="tarjeta acento-amarillo pila">
    ${ilustracion(ICONOS.llama, 'azul')}
    <h1 class="titulo centro">¡Tablero agotado!</h1>
    <p class="texto centro">El último número (${evento.numero}) lo compartían: <strong>${nombres}</strong>. Se juega un desempate solo entre ellos, con un tablero nuevo. Cada uno elige un nuevo número secreto.</p>
    <button class="btn btn-primario" data-accion="desempate">${ICONOS.revancha()} Empezar desempate</button>
  </section>`;
}
function pantallaFinal(){
  const evento = estado.ultimoEvento, perdedor = nombrePorId(estado.idPerdedor);
  const motivo = evento.tipo === TipoEvento.QUEMADO ? `Tachó su propio número (${evento.numero}): ¡quemó la olla!`
    : evento.tipo === TipoEvento.COMPARTIDO ? `Tachó el ${evento.numero}, que tenían varios jugadores.`
    : `Fue el último en pie tras eliminar a ${escapar(nombrePorId(evento.idVictima))}.`;
  const salvados = estado.jugadoresPartida.filter(j => j.id !== estado.idPerdedor)
    .map(j => `<span>${ICONOS.escudo()} ${escapar(j.nombre)}</span>`).join('');
  return `<section class="tarjeta acento-magenta pila">
    ${ilustracion(ICONOS.salpicadura, 'magenta')}
    <p class="sobretitulo centro">Perdió</p>
    <h1 class="titulo titulo-final">${escapar(perdedor)}</h1>
    <p class="texto centro">${motivo}</p>
    <div class="caja-premio">${ICONOS.copaApuesta()} ${escapar(premioActual())}</div>
    <p class="sobretitulo centro">A salvo</p><div class="lista-salvados">${salvados}</div>
    <button class="btn btn-primario" data-accion="denuevo">${ICONOS.revancha()} Jugar de nuevo</button>
  </section>`;
}
function htmlAviso(){
  if (estado.pantalla !== Pantalla.JUEGO || estado.seleccionado === null) return '';
  return `<div class="aviso" role="status"><span>Toca de nuevo el <b>${estado.seleccionado}</b> para confirmar</span>
    <button data-accion="cancelar">Cancelar</button></div>`;
}
function htmlMano(){
  if (!estado.mano) return '';
  const m = estado.mano;
  const mano = `<svg class="mano-svg" viewBox="0 0 200 270" aria-hidden="true"><g fill="#FFD400" stroke="#1A1A1A" stroke-width="5">
    <rect x="46" y="44" width="28" height="110" rx="14"/><rect x="77" y="20" width="28" height="130" rx="14"/>
    <rect x="108" y="30" width="28" height="120" rx="14"/><rect x="139" y="62" width="26" height="96" rx="13"/>
    <rect x="12" y="122" width="30" height="86" rx="15" transform="rotate(-32 27 165)"/>
    <rect x="40" y="110" width="126" height="140" rx="48"/></g>
    <text x="103" y="205" text-anchor="middle" font-size="${String(m.numero).length > 1 ? 76 : 92}" font-weight="800" fill="#EC008C" stroke="#fff" stroke-width="2" font-family="Poppins, system-ui, sans-serif">${m.numero}</text></svg>`;
  return `<div class="mano-capa" data-accion="mano-cerrar">
    <div class="mano-contenido">${mano}
      <h2 class="mano-titulo">¡${escapar(m.victima)} eliminado!</h2>
      <p class="mano-autor">Ganó esta ronda: <strong>${escapar(m.autor)}</strong></p></div></div>`;
}
function htmlAyuda(){
  if (!estado.ayudaAbierta) return '';
  return `<div class="modal" data-accion="ayuda-fondo"><div class="tarjeta" role="dialog" aria-label="Cómo jugar">
    <button class="btn-icono cerrar" data-accion="ayuda-cerrar" aria-label="Cerrar">${ICONOS.cerrar()}</button>
    <h2 class="subtitulo">${ICONOS.ayuda()} Cómo jugar</h2>
    <ol class="reglas">
      <li>Juegan de <strong>2 a 10</strong> personas con un solo dispositivo.</li>
      <li>Cada quien elige en secreto un número del tablero (del <strong>1 al 10</strong> por defecto, configurable hasta el 20). Se pueden repetir.</li>
      <li>Por turnos, toca un número para <strong>resaltarlo</strong> y tócalo <strong>otra vez para confirmar</strong>.</li>
      <li>Si tachas <strong>tu propio número</strong>, pierdes.</li>
      <li>Si tachas el número de <strong>un solo jugador</strong>, queda eliminado. Si solo queda uno vivo, ese pierde.</li>
      <li>Si tachas un número de <strong>dos o más jugadores</strong>, pierdes tú.</li>
      <li>Si nadie lo tiene, no pasa nada y sigue el turno.</li>
      <li>Si el <strong>último número</strong> lo comparten varios, hay desempate entre ellos.</li>
      <li>Quien pierde cumple el premio elegido al inicio.</li>
    </ol>
    <button class="btn btn-secundario" data-accion="ayuda-cerrar">Entendido</button>
  </div></div>`;
}
function renderizar(){
  const pantallas = { [Pantalla.INICIO]:pantallaInicio, [Pantalla.CONFIGURACION]:pantallaConfiguracion, [Pantalla.RELEVO]:pantallaRelevo,
    [Pantalla.ELEGIR]:pantallaElegir, [Pantalla.JUEGO]:pantallaJuego, [Pantalla.DESEMPATE]:pantallaDesempate, [Pantalla.FINAL]:pantallaFinal };
  document.getElementById('app').innerHTML = pantallas[estado.pantalla]();
  document.getElementById('raiz-aviso').innerHTML = htmlAviso();
  document.getElementById('raiz-mano').innerHTML = htmlMano();
  document.getElementById('raiz-modal').innerHTML = htmlAyuda();
  window.scrollTo(0, 0);
}
