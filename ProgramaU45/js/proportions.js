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