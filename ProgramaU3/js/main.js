import { simularHospital } from './simulation.js';
import { generarHistograma, calcularProbabilidad, comparar } from './charts.js';

document.getElementById("btnSimular").addEventListener("click", () => {
    let lambda = parseFloat(document.getElementById("lambda").value);
    let cap = parseInt(document.getElementById("capacidad").value);

    simularHospital(lambda, cap);
});

document.getElementById("btnHist").addEventListener("click", () => {
    let lambda = parseFloat(document.getElementById("lambda").value);
    let k = parseInt(document.getElementById("umbral").value);

    let data = generarHistograma(lambda);
    calcularProbabilidad(data, k);
    comparar(lambda);
});