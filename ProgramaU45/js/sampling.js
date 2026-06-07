function simpleRandomSample(data, n) {
    const shuffled = shuffle(data);
    return shuffled.slice(0, n);
}

// Bootstrap sample (con reemplazo)
function bootstrapSample(data, n) {
    const sample = [];

    for (let i = 0; i < n; i++) {
        const index = Math.floor(Math.random() * data.length);
        sample.push(data[index]);
    }

    return sample;
}