// ============================
// APP.JS - Constructor de probabilidad con depuración
// ============================

const slots = document.querySelectorAll(".slot");

/* ===========================
   DRAG & DROP CON SNAP
=========================== */
slots.forEach(slot => {
  slot.addEventListener("dragover", e => {
    e.preventDefault();
    const tipo = e.dataTransfer.getData("type");
    if (slot.dataset.type === tipo) slot.classList.add("hover");
  });

  slot.addEventListener("dragleave", () => { slot.classList.remove("hover"); });

  slot.addEventListener("drop", e => {
    e.preventDefault();
    const word = e.dataTransfer.getData("text");
    const tipo = e.dataTransfer.getData("type");
    if (slot.dataset.type !== tipo) return;

    slot.innerText = word;
    slot.classList.add("filled");
    slot.classList.remove("hover");

    console.log(`[DEBUG] Slot rellenado: ${tipo} -> ${word}`);
    actualizarPreview();
  });
});

/* ===========================
   FUNCIONES AUXILIARES
=========================== */

function combinacion(n, k) {
  if (k > n || k < 0) return 0;
  let res = 1;
  for (let i = 1; i <= k; i++) res = res * (n - i + 1) / i;
  return res;
}

function calcularCartasEvento(tipo, color) {
  const tipos = { "Ases": 4, "Reyes": 4, "Reinas": 4, "Jotas": 4 };
  const colores = { "Rojas": 26, "Negras": 26 };

  console.log(`[DEBUG] calcularCartasEvento -> tipo: ${tipo}, color: ${color}`);

  if (tipo && !color) return tipos[tipo];
  if (!tipo && color) return colores[color];
  if (tipo && color) {
    const interseccion = 2; // Ases rojos, Jotas negras, etc.
    return interseccion;
  }

  return 0; // Si no hay tipo ni color
}

function calcularProbabilidad({ N, K, n, k, condicion }) {
  let prob = 0;
  console.log(`[DEBUG] calcularProbabilidad -> N:${N}, K:${K}, n:${n}, k:${k}, condicion:${condicion}`);

  if (condicion === "exactamente") {
    prob = combinacion(K, k) * combinacion(N - K, n - k) / combinacion(N, n);
  } else if (condicion === "al menos") {
    for (let i = k; i <= Math.min(K, n); i++)
      prob += combinacion(K, i) * combinacion(N - K, n - i) / combinacion(N, n);
  } else if (condicion === "como máximo") {
    for (let i = 0; i <= k; i++)
      prob += combinacion(K, i) * combinacion(N - K, n - i) / combinacion(N, n);
  }

  console.log(`[DEBUG] Probabilidad calculada (sin reemplazo): ${prob}`);
  return prob;
}

/* ===========================
   ACTUALIZAR VISTA PREVIA
=========================== */
function actualizarPreview() {
  const valores = [...document.querySelectorAll(".slot")].map(s => s.innerText || "");
  const texto = `Probabilidad de ${valores[0]} ${valores[1]} ${valores[2]} ${valores[3]} al sacar ${valores[4]} cartas ${valores[5]}`;
  document.getElementById("preview").innerText = texto.replace(/\s+/g, " ");
  console.log(`[DEBUG] Vista previa: ${texto}`);
}

/* ===========================
   PARSER PRINCIPAL
=========================== */
function procesar() {
  const valores = {};
  document.querySelectorAll(".slot").forEach(s => { valores[s.dataset.type] = s.innerText || ""; });

  console.log("[DEBUG] Valores slots:", valores);

  const tipo = valores["Tipo de cartas"] || null;
  const color = valores["Color de cartas"] || null;
  const k = parseInt(valores["Número de cartas"]) || 0;
  const n = parseInt(valores["Número de cartas sacadas"]) || 0;
  const condicion = valores["Condición"];
  const reemplazo = valores["Reemplazo"];

  // VALIDACIONES
  if (!tipo && !color) {
    document.getElementById("resultado").innerHTML =
      `<h2>Selecciona al menos tipo o color de carta</h2>`;
    console.warn("[WARN] No se seleccionó tipo ni color");
    return;
  }

  if (k <= 0) {
    document.getElementById("resultado").innerHTML =
      `<h2>Selecciona el número de cartas deseadas</h2>`;
    console.warn("[WARN] Número de cartas inválido");
    return;
  }

  if (n <= 0) {
    document.getElementById("resultado").innerHTML =
      `<h2>Selecciona el número de cartas a sacar</h2>`;
    console.warn("[WARN] Número de cartas a sacar inválido");
    return;
  }

  const N = 52;
  const K = calcularCartasEvento(tipo, color);

  if (k > K && reemplazo === "sin reemplazo") {
    document.getElementById("resultado").innerHTML =
      `<h2>Imposible: solo hay ${K} carta(s) del tipo/color seleccionado</h2>`;
    console.warn("[WARN] Evento imposible: k > K");
    return;
  }

  if (n > N) {
    document.getElementById("resultado").innerHTML =
      `<h2>Imposible: no puedes sacar más cartas de las que hay en la baraja</h2>`;
    console.warn("[WARN] Número de cartas a sacar > N");
    return;
  }

  // CÁLCULO DE PROBABILIDAD
  let prob = 0;
  if (reemplazo === "sin reemplazo") {
    prob = calcularProbabilidad({ N, K, n, k, condicion });
  } else {
    const p = K / N;
    prob = combinacion(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
    console.log(`[DEBUG] Probabilidad calculada (con reemplazo): ${prob}`);
  }

  document.getElementById("resultado").innerHTML = `<h2>Probabilidad: ${prob.toFixed(6)}</h2>`;
  console.log(`[DEBUG] Resultado final: ${prob}`);
}