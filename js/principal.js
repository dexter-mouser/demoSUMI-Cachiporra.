document.getElementById('btn-ayuda').innerHTML = ICONOS.ayuda();

document.addEventListener('click', e => {
  const elemento = e.target.closest('[data-accion]');
  if (!elemento) return;
  const accion = elemento.dataset.accion, numero = Number(elemento.dataset.numero);
  if (accion === 'ayuda-fondo' && e.target !== elemento) return; // un clic dentro de la tarjeta no cierra
  const acciones = {
    menos: () => fijarCantidad(estado.cantidad - 1), mas: () => fijarCantidad(estado.cantidad + 1),
    iniciar: iniciarPartida, relevo: confirmarRelevo, elegir: () => elegirNumero(numero), secreto: confirmarSecreto,
    celda: () => tocarCelda(numero), cancelar: cancelarSeleccion, desempate: iniciarDesempate, denuevo: jugarDeNuevo,
    ayuda: () => alternarAyuda(true), 'ayuda-cerrar': () => alternarAyuda(false), 'ayuda-fondo': () => alternarAyuda(false)
  };
  if (acciones[accion]) acciones[accion]();
});
document.addEventListener('input', e => {
  if (e.target.dataset.indice !== undefined) fijarNombre(Number(e.target.dataset.indice), e.target.value);
  else if (e.target.dataset.apuesta !== undefined) fijarApuesta(e.target.value);
});

renderizar();
