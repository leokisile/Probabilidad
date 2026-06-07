function samplingDistributionMean(data, column, sampleSize, iterations) {
    const values = getNumericValues(data, column);

    const means = [];

    for (let i = 0; i < iterations; i++) {
        const sample = [];

        for (let j = 0; j < sampleSize; j++) {
            const randomIndex = Math.floor(Math.random() * values.length);
            sample.push(values[randomIndex]);
        }

        means.push(mean(sample));
    }

    return means;
}

function samplingDistributionProportion(data, column, value, sampleSize, iterations) {
    const results = [];

    for (let i = 0; i < iterations; i++) {
        const sample = bootstrapSample(data, sampleSize);

        const p = proportion(sample, column, value);

        results.push(p);
    }

    return results;
}