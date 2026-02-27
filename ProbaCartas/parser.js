function interpretarTexto(texto){
  texto = texto.toLowerCase();

  // Números
  const numeros = texto.match(/\d+/g)?.map(Number) || [];

  const k = numeros[0] || 1; // cartas deseadas
  const n = numeros[1] || 1; // cartas tomadas

  // Tipo de carta
  let tipo = "ases";
  for(const t of WORD_BANK["Tipos de cartas"]){
    if(texto.includes(t)){
      tipo = t;
      break;
    }
  }

  const K = WORD_BANK["Tipos de cartas"].map(t=>t.toLowerCase() === tipo ? 4 : 4)[0]; // simplificado

  // Detectar condición: exacto / al menos / como máximo
  let condicion = "exactamente";
  for(const c of WORD_BANK["Condiciones"]){
    if(texto.includes(c)) condicion = c;
  }

  return {N:52, K, n, k, condicion};
}
function calcularCartasEvento(tipo, color){

  const tipos = {
    "Ases":4,
    "Reyes":4,
    "Reinas":4,
    "Jotas":4
  };

  const colores = {
    "Rojas":26,
    "Negras":26
  };

  // Solo tipo
  if(tipo && !color)
    return tipos[tipo];

  // Solo color
  if(!tipo && color)
    return colores[color];

  // Ambos → UNION (OR)
  if(tipo && color){

    const interseccion = 2; 
    // cada tipo tiene 2 cartas por color

    return tipos[tipo] + colores[color] - interseccion;
  }

  return null;
}