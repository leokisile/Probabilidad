export function poisson(lambda) {
    let L = Math.exp(-lambda);
    let k = 0;
    let p = 1;

    do {
        k++;
        p *= Math.random();
    } while (p > L);

    return k - 1;
}