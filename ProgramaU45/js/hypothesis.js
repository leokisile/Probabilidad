function zTestMean(sampleMean, mu, sigma, n) {
    return (sampleMean - mu) / (sigma / Math.sqrt(n));
}

function zTestProportion(pHat, p0, n) {
    return (pHat - p0) / Math.sqrt((p0 * (1 - p0)) / n);
}

function interpret(pValue, alpha = 0.05) {
    return pValue < alpha ? "RECHAZAR H0" : "NO RECHAZAR H0";
}