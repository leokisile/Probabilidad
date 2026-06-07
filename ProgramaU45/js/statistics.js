function isNumericColumn(data, column) {
    return data.every(row =>
        typeof row[column] === "number" &&
        !isNaN(row[column])
    );
}

function getNumericValues(data, column) {
    return data
        .map(row => row[column])
        .filter(v => typeof v === "number" && !isNaN(v));
}

function mean(values) {
    return values.reduce((a, b) => a + b, 0) / values.length;
}

function median(values) {
    const sorted = [...values].sort((a, b) => a - b);

    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
}

function mode(values) {

    const frequency = {};

    values.forEach(v => {
        frequency[v] = (frequency[v] || 0) + 1;
    });

    let maxFreq = 0;
    let modeValue = null;

    for (const key in frequency) {

        if (frequency[key] > maxFreq) {

            maxFreq = frequency[key];
            modeValue = key;

        }

    }

    return Number(modeValue);
}

function variance(values) {

    const m = mean(values);

    return values.reduce(
        (sum, value) => sum + Math.pow(value - m, 2),
        0
    ) / (values.length - 1);

}

function standardDeviation(values) {
    return Math.sqrt(variance(values));
}

function minimum(values) {
    return Math.min(...values);
}

function maximum(values) {
    return Math.max(...values);
}

function range(values) {
    return maximum(values) - minimum(values);
}

function calculateDescriptiveStats(data, column) {

    const values = getNumericValues(data, column);

    return {

        count: values.length,

        mean: mean(values),

        median: median(values),

        mode: mode(values),

        variance: variance(values),

        standardDeviation: standardDeviation(values),

        min: minimum(values),

        max: maximum(values),

        range: range(values)

    };
}

function frequencyTable(data, column) {

    const frequencies = {};

    data.forEach(row => {

        const value = row[column];

        frequencies[value] =
            (frequencies[value] || 0) + 1;

    });

    return frequencies;
}