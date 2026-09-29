// Único archivo con estado mutable + controlador (conecta motor y vista).
const estado = {
  pantalla: Pantalla.CONFIGURACION, cantidad: 4, nombres: [], apuesta: '',
  jugadoresPartida: [], sesion: null,
  indiceElegir: 0, valorElegido: null, seleccionado: null,
  ultimoEvento: null, idPerdedor: null, ayudaAbierta: false
};
function nombreDe(indice){ return (estado.nombres[indice] || '').trim() || 'Jugador ' + (indice + 1); }
function nombrePorId(id){ const j = estado.jugadoresPartida.find(j => j.id === id); return j ? j.nombre : ''; }

function fijarCantidad(n){ estado.cantidad = Math.min(JUGADORES_MAX, Math.max(JUGADORES_MIN, n)); renderizar(); }
function fijarNombre(indice, valor){ estado.nombres[indice] = valor; }
function fijarApuesta(valor){ estado.apuesta = valor; }

function iniciarPartida(){
  estado.jugadoresPartida = Array.from({ length: estado.cantidad }, (_, i) => ({ id: i, nombre: nombreDe(i) }));
  estado.sesion = crearSesion(estado.jugadoresPartida);
  estado.indiceElegir = 0; estado.valorElegido = null; estado.seleccionado = null;
  estado.ultimoEvento = null; estado.idPerdedor = null;
  estado.pantalla = Pantalla.RELEVO; renderizar();
}
function confirmarRelevo(){ estado.valorElegido = null; estado.pantalla = Pantalla.ELEGIR; renderizar(); }
function elegirNumero(n){ estado.valorElegido = n; renderizar(); }
function confirmarSecreto(){
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
function tocarCelda(n){
  if (estado.pantalla !== Pantalla.JUEGO || estado.sesion.tachados.includes(n)) return;
  if (estado.seleccionado !== n){ estado.seleccionado = n; renderizar(); return; }
  estado.seleccionado = null;
  const { evento, sesion } = resolverTachado(estado.sesion, n);
  estado.ultimoEvento = evento; estado.sesion = sesion;
  if (evento.tipo === TipoEvento.DESEMPATE){ estado.pantalla = Pantalla.DESEMPATE; }
  else if (evento.idPerdedor !== undefined){ estado.idPerdedor = evento.idPerdedor; estado.pantalla = Pantalla.FINAL; }
  renderizar();
}
function cancelarSeleccion(){ estado.seleccionado = null; renderizar(); }
function iniciarDesempate(){ estado.indiceElegir = 0; estado.valorElegido = null; estado.pantalla = Pantalla.RELEVO; renderizar(); }
function jugarDeNuevo(){ estado.pantalla = Pantalla.CONFIGURACION; estado.ultimoEvento = null; renderizar(); }
function alternarAyuda(abierta){ estado.ayudaAbierta = abierta; renderizar(); }
