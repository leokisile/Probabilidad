// Calcula la proporción de un valor específico. 
// Si no se define el 'value', busca el elemento con mayor frecuencia en la columna de forma dinámica.
function getSmartProportion(data, column, targetValue = "") {
    const total = data.length;
    if (total === 0) return { value: null, proportion: 0, count: 0 };

    const freq = frequencyTable(data, column);
    
    let finalValue = targetValue;
    
    // Si no se provee un criterio, elegimos el valor dominante (Moda) de manera automática
    if (!targetValue || targetValue.trim() === "") {
        let maxCount = -1;
        for (const [key, count] of Object.entries(freq)) {
            if (count > maxCount) {
                maxCount = count;
                finalValue = key;
            }
        }
    }

    const count = freq[finalValue] || 0;
    return {
        value: finalValue,
        count: count,
        proportion: count / total
    };
}

// Agrega esto en statistics.js o proportions.js
function proportion(data, column, value) {
    const total = data.length;
    if (total === 0) return 0;
    const count = data.filter(row => String(row[column]) === String(value)).length;
    return count / total;
}

// Agrega esto en proportions.js
function proportionsTable(data, column) {
    const freq = frequencyTable(data, column);
    const total = data.length;
    const table = {};
    
    for (const [key, count] of Object.entries(freq)) {
        table[key] = {
            count: count,
            proportion: count / total
        };
    }
    return table;
}