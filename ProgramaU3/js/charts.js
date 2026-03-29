import { poisson } from './poisson.js';

let histChart, probChart, compChart;

export function generarHistograma(lambda) {
    let data = {};

    for (let i = 0; i < 1000; i++) {
        let x = poisson(lambda);
        data[x] = (data[x] || 0) + 1;
    }

    let labels = Object.keys(data);
    let values = Object.values(data);

    if (histChart) histChart.destroy();

    histChart = new Chart(document.getElementById("histograma"), {
        type: 'bar',
        data: {
            labels,
            datasets: [{ label: "Frecuencia", data: values }]
        }
    });

    return data;
}

export function calcularProbabilidad(data, k) {
    let total = Object.values(data).reduce((a,b)=>a+b,0);
    let prob = 0;

    for (let key in data) {
        if (parseInt(key) > k) {
            prob += data[key] / total;
        }
    }

    document.getElementById("resultado").innerText =
        `P(X > ${k}) ≈ ${prob.toFixed(4)}\n Lambda: ${document.getElementById("lambda").value}`;
}

export function comparar(lambda) {
    let data1 = [], data3 = [];

    for (let i = 0; i < 200; i++) {
        data1.push(poisson(lambda));
        data3.push(poisson(lambda * 3));
    }

    if (compChart) compChart.destroy();

    compChart = new Chart(document.getElementById("comparacion"), {
        type: 'line',
        data: {
            labels: data1.map((_,i)=>i),
            datasets: [
                { label: "1h", data: data1 },
                { label: "3h", data: data3 }
            ]
        }
    });
}