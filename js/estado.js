// Único archivo con estado mutable + controlador (conecta motor y vista).
const estado = {
  pantalla: Pantalla.INICIO, cantidad: 4, rango: RANGO_DEFECTO, nombres: [],
  premioIndice: 0, premioTexto: '',
  jugadoresPartida: [], sesion: null,
  indiceElegir: 0, valorElegido: null, seleccionado: null,
  ultimoEvento: null, idPerdedor: null, ayudaAbierta: false, mano: null
};
let temporizadorMano = null;
function nombreDe(indice) { return (estado.nombres[indice] || '').trim() || 'Jugador ' + (indice + 1); }
function nombrePorId(id) { const j = estado.jugadoresPartida.find(j => j.id === id); return j ? j.nombre : ''; }
function premioActual() {
  return estado.premioIndice === PREMIO_PERSONALIZADO
    ? (estado.premioTexto.trim() || 'lo que se haya acordado') : PREMIOS[estado.premioIndice];
}

function irAConfiguracion() { estado.pantalla = Pantalla.CONFIGURACION; renderizar(); }
function fijarCantidad(n) { estado.cantidad = Math.min(JUGADORES_MAX, Math.max(JUGADORES_MIN, n)); renderizar(); }
function fijarRango(n) { estado.rango = Math.min(RANGO_MAX, Math.max(RANGO_MIN, n)); renderizar(); }
function fijarNombre(indice, valor) { estado.nombres[indice] = valor; }
function fijarPremio(indice) { estado.premioIndice = indice; renderizar(); }
function fijarPremioTexto(valor) { estado.premioTexto = valor; }

function iniciarPartida() {
  estado.jugadoresPartida = Array.from({ length: estado.cantidad }, (_, i) => ({ id: i, nombre: nombreDe(i) }));
  estado.sesion = crearSesion(estado.jugadoresPartida, estado.rango);
  estado.indiceElegir = 0; estado.valorElegido = null; estado.seleccionado = null;
  estado.ultimoEvento = null; estado.idPerdedor = null; estado.mano = null;
  estado.pantalla = Pantalla.RELEVO; renderizar();
}
function confirmarRelevo() { estado.valorElegido = null; estado.pantalla = Pantalla.ELEGIR; renderizar(); }
function elegirNumero(n) { estado.valorElegido = n; renderizar(); }
function confirmarSecreto() {
  if (!estado.valorElegido) return;
  const sesion = estado.sesion;
  const jugadores = sesion.jugadores.map((j, i) => i === estado.indiceElegir ? { ...j, secreto: estado.valorElegido } : j);
  estado.sesion = { ...sesion, jugadores };
  estado.indiceElegir++; estado.valorElegido = null;
  if (estado.indiceElegir < jugadores.length) estado.pantalla = Pantalla.RELEVO;
  else { estado.pantalla = Pantalla.JUEGO; estado.seleccionado = null; }
  renderizar();
}

// Toque 1: resalta el número. Toque 2 sobre el mismo: confirma. Otro número: cambia la selección.
function tocarCelda(n) {
  if (estado.pantalla !== Pantalla.JUEGO || estado.sesion.tachados.includes(n)) return;
  if (estado.seleccionado !== n) { estado.seleccionado = n; renderizar(); return; }
  estado.seleccionado = null;
  const { evento, sesion } = resolverTachado(estado.sesion, n);
  estado.ultimoEvento = evento; estado.sesion = sesion;
  if (evento.tipo === TipoEvento.DESEMPATE) { estado.pantalla = Pantalla.DESEMPATE; }
  else if (evento.idPerdedor !== undefined) { estado.idPerdedor = evento.idPerdedor; estado.pantalla = Pantalla.FINAL; }
  if (evento.tipo === TipoEvento.ELIMINADO || evento.tipo === TipoEvento.ULTIMO_EN_PIE) {
    estado.mano = { numero: evento.numero, victima: nombrePorId(evento.idVictima), autor: nombrePorId(evento.idAutor) };
    clearTimeout(temporizadorMano);
    temporizadorMano = setTimeout(cerrarMano, DURACION_MANO_MS);
  }
  renderizar();
}
function cerrarMano() { clearTimeout(temporizadorMano); estado.mano = null; renderizar(); }
function cancelarSeleccion() { estado.seleccionado = null; renderizar(); }
function iniciarDesempate() { estado.indiceElegir = 0; estado.valorElegido = null; estado.pantalla = Pantalla.RELEVO; renderizar(); }
function jugarDeNuevo() { estado.pantalla = Pantalla.CONFIGURACION; estado.ultimoEvento = null; renderizar(); }
function alternarAyuda(abierta) { estado.ayudaAbierta = abierta; renderizar(); }

function irAInicio() {
  const enCurso = [Pantalla.RELEVO, Pantalla.ELEGIR, Pantalla.JUEGO, Pantalla.DESEMPATE].includes(estado.pantalla);
  if (enCurso && !window.confirm('¿Volver al inicio? Se perderá la partida en curso.')) return;
  clearTimeout(temporizadorMano);
  estado.mano = null; estado.seleccionado = null; estado.ayudaAbierta = false;
  estado.pantalla = Pantalla.INICIO; renderizar();
}
