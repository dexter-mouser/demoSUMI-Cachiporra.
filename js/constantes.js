const JUGADORES_MIN = 2;
const JUGADORES_MAX = 10;
const RANGO_MIN = 5;
const RANGO_MAX = 20;
const RANGO_DEFECTO = 10;
const DURACION_MANO_MS = 2800;
const PREMIO_PERSONALIZADO = -1;
const PREMIOS = ['Gaseosa', 'Tinto'];
const Pantalla = { INICIO:'inicio', CONFIGURACION:'configuracion', RELEVO:'relevo', ELEGIR:'elegir', JUEGO:'juego', DESEMPATE:'desempate', FINAL:'final' };
const TipoEvento = {
  NADA:'nada', IGNORADO:'ignorado', ELIMINADO:'eliminado',
  QUEMADO:'quemado', COMPARTIDO:'compartido', ULTIMO_EN_PIE:'ultimo_en_pie', DESEMPATE:'desempate'
};
