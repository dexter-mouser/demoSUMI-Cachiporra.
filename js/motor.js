// Motor de reglas — lógica pura, sin DOM. No modifica la sesión recibida.
function crearSesion(jugadores){
  return {
    jugadores: jugadores.map(j => ({ id:j.id, nombre:j.nombre, secreto:null, vivo:true })),
    tachados: [],
    turno: 0
  };
}
function siguienteVivo(jugadores, desde){
  for (let i = 1; i <= jugadores.length; i++){
    const indice = (desde + i) % jugadores.length;
    if (jugadores[indice].vivo) return indice;
  }
  return desde;
}
function resolverTachado(sesion, numero){
  // 1. número ya tachado: se ignora
  if (sesion.tachados.includes(numero)) return { evento:{ tipo:TipoEvento.IGNORADO }, sesion };

  const actual = sesion.jugadores[sesion.turno];
  const poseedores = sesion.jugadores.filter(j => j.vivo && j.secreto === numero);
  const esUltimo = sesion.tachados.length === TAMANO_TABLERO - 1;
  const tachados = [...sesion.tachados, numero];

  // 2. último número compartido por 2+ vivos: desempate
  if (esUltimo && poseedores.length >= 2){
    return { evento:{ tipo:TipoEvento.DESEMPATE, numero, idsPoseedores:poseedores.map(j => j.id) },
             sesion:crearSesion(poseedores) };
  }
  // 3. tu propio secreto: pierdes
  if (actual.secreto === numero){
    return { evento:{ tipo:TipoEvento.QUEMADO, numero, idPerdedor:actual.id }, sesion:{ ...sesion, tachados } };
  }
  // 4. secreto de exactamente un jugador vivo: queda eliminado
  if (poseedores.length === 1){
    const victima = poseedores[0];
    const jugadores = sesion.jugadores.map(j => j.id === victima.id ? { ...j, vivo:false } : j);
    const vivos = jugadores.filter(j => j.vivo);
    if (vivos.length === 1){
      return { evento:{ tipo:TipoEvento.ULTIMO_EN_PIE, numero, idVictima:victima.id, idPerdedor:vivos[0].id },
               sesion:{ ...sesion, jugadores, tachados } };
    }
    return { evento:{ tipo:TipoEvento.ELIMINADO, numero, idVictima:victima.id, idAutor:actual.id },
             sesion:{ jugadores, tachados, turno:siguienteVivo(jugadores, sesion.turno) } };
  }
  // 5. secreto de 2+ jugadores vivos: pierde quien tachó
  if (poseedores.length >= 2){
    return { evento:{ tipo:TipoEvento.COMPARTIDO, numero, idPerdedor:actual.id }, sesion:{ ...sesion, tachados } };
  }
  // 6. nadie lo tiene: sigue el turno
  return { evento:{ tipo:TipoEvento.NADA, numero, idAutor:actual.id },
           sesion:{ ...sesion, tachados, turno:siguienteVivo(sesion.jugadores, sesion.turno) } };
}
