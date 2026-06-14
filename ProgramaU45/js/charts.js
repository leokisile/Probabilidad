let currentChart = null;

function destroyChart() {

    if (currentChart) {

        currentChart.destroy();

        currentChart = null;

    }

}

function drawHistogram(values, variableName) {

    destroyChart();

    const min = Math.min(...values);
    const max = Math.max(...values);

    const bins = 10;

    const width = (max - min) / bins;

    const frequencies = Array(bins).fill(0);

    values.forEach(value => {

        let index = Math.floor(
            (value - min) / width
        );

        if (index >= bins) {
            index = bins - 1;
        }

        frequencies[index]++;

    });

    const labels = [];

    for (let i = 0; i < bins; i++) {

        const start =
            (min + i * width).toFixed(2);

        const end =
            (min + (i + 1) * width).toFixed(2);

        labels.push(`${start}-${end}`);

    }

    const ctx =
        document
            .getElementById("chartCanvas")
            .getContext("2d");

    currentChart = new Chart(ctx, {

        type: "bar",

        data: {

            labels,

            datasets: [{
                label: variableName,
                data: frequencies
            }]

        },

        options: {

            responsive: true,

            scales: {

                y: {
                    beginAtZero: true
                }

            }

        }

    });

}

function drawBarChart(frequencies, variableName) {

    destroyChart();

    const labels =
        Object.keys(frequencies);

    const values =
        Object.values(frequencies);

    const ctx =
        document
            .getElementById("chartCanvas")
            .getContext("2d");

    currentChart = new Chart(ctx, {

        type: "bar",

        data: {

            labels,

            datasets: [{

                label: variableName,

                data: values

            }]

        },

        options: {

            responsive: true,

            scales: {

                y: {

                    beginAtZero: true

                }

            }

        }

    });

}

function drawCorrelationLineChart(xVals, yVals, labelX, labelY) {
    destroyChart();

    const n = xVals.length;

    // 1. CALCULO DE REGRESIÓN LINEAL (Línea de Correlación)
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
        sumX += xVals[i];
        sumY += yVals[i];
        sumXY += xVals[i] * yVals[i];
        sumX2 += xVals[i] * xVals[i];
    }

    // Pendiente (m) e Intersección (b)
    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / n;

    // Generar los puntos de la línea de tendencia de correlación
    const correlationLineData = xVals.map(x => m * x + b);

    // 2. CONFIGURACIÓN DEL GRÁFICO EN CHART.JS
    const ctx = document.getElementById("chartCanvas").getContext("2d");

    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xVals.map((_, i) => `Reg ${i + 1}`), // Eje X secuencial (por cada registro)
            datasets: [
                {
                    label: `Variable X: ${labelX}`,
                    data: xVals,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'transparent',
                    yAxisID: 'yX', // Eje izquierdo
                    borderWidth: 2,
                    pointRadius: 2
                },
                {
                    label: `Variable Y: ${labelY}`,
                    data: yVals,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'transparent',
                    yAxisID: 'yY', // Eje derecho
                    borderWidth: 2,
                    pointRadius: 2
                },
                {
                    label: 'Línea de Correlación (Tendencia de Y)',
                    data: correlationLineData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderDash: [5, 5], // Línea punteada
                    backgroundColor: 'transparent',
                    yAxisID: 'yY', // Sigue el eje de la variable dependiente Y
                    borderWidth: 3,
                    pointRadius: 0 // Sin puntos, solo la línea
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                yX: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: labelX, color: 'rgba(54, 162, 235, 1)' }
                },
                yY: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: labelY, color: 'rgba(255, 99, 132, 1)' },
                    // Evita que las cuadrículas se encimen y se vea feo
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}