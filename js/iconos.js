const _envolverSvg = (interior) => `<svg viewBox="0 0 24 24" aria-hidden="true">${interior}</svg>`;
const _trazo = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const ICONOS = {
  gotaTinta:   () => _envolverSvg('<path fill="currentColor" d="M12 2C9 7 5 11.2 5 15.2 5 19.5 8.1 22 12 22s7-2.5 7-6.8C19 11.2 15 7 12 2z"/>'),
  llama:       () => _envolverSvg('<path fill="currentColor" d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-10z"/>'),
  relevo:      () => _envolverSvg(`<rect x="7" y="2" width="10" height="20" rx="2.5" ${_trazo}/><circle cx="12" cy="18" r="1.2" fill="currentColor"/>`),
  diana:       () => _envolverSvg(`<circle cx="12" cy="12" r="9" ${_trazo}/><circle cx="12" cy="12" r="4" ${_trazo}/>`),
  salpicadura: () => _envolverSvg('<path fill="currentColor" d="M12 2l2.4 5.6L20 6l-2 5.6 5 2.9-5.6 1.4L18 22l-6-3-6 3 .6-6.1L1 14.5l5-2.9L4 6l5.6 1.6z"/>'),
  escudo:      () => _envolverSvg('<path fill="currentColor" fill-rule="evenodd" d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-3zm-1 13l6-6-1.4-1.4L11 12.2 8.4 9.6 7 11l4 4z"/>'),
  copaApuesta: () => _envolverSvg('<path fill="currentColor" d="M5 3h14v5a7 7 0 0 1-6 6.9V19h4v2H7v-2h4v-4.1A7 7 0 0 1 5 8V3z"/>'),
  ayuda:       () => _envolverSvg(`<circle cx="12" cy="12" r="10" ${_trazo}/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7" ${_trazo}/><circle cx="12" cy="17" r="1.1" fill="currentColor"/>`),
  cerrar:      () => _envolverSvg(`<path d="M6 6l12 12M18 6L6 18" ${_trazo}/>`),
  revancha:    () => _envolverSvg(`<path d="M20 12a8 8 0 1 1-2.5-5.8M20 4v5h-5" ${_trazo}/>`)
};
