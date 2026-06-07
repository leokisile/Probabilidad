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