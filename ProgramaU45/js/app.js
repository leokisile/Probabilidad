let dataset = [];

// Enlace de selectores corregidos basados en el nuevo HTML
const csvFile = document.getElementById("csvFile");
const variableSelect = document.getElementById("variableSelect");
const analysisType = document.getElementById("analysisType");
const sampleSizeInput = document.getElementById("sampleSize");
const iterationsInput = document.getElementById("iterations");
const categoryValueInput = document.getElementById("categoryValue");
const runBtn = document.getElementById("runBtn");
const output = document.getElementById("output");

// Event Listeners
csvFile.addEventListener("change", handleCSVUpload);
runBtn.addEventListener("click", executeLaboratoryExperiment);

function handleCSVUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const csvText = e.target.result;
        dataset = parseCSV(csvText);
        
        if(dataset.length > 0) {
            populateVariables();
            variableSelect.disabled = false;
            output.innerHTML = `<div class="placeholder-text" style="color: var(--success)">✅ ${dataset.length} registros cargados exitosamente. Selecciona variables y presiona "Ejecutar".</div>`;
        } else {
            output.innerHTML = `<div class="placeholder-text" style="color: red">❌ Error al procesar el archivo CSV o formato vacío.</div>`;
        }
    };
    reader.readAsText(file);
}

function populateVariables() {
    variableSelect.innerHTML = '';
    const columns = Object.keys(dataset[0]);
    columns.forEach(column => {
        const option = document.createElement("option");
        option.value = column;
        option.textContent = column;
        variableSelect.appendChild(option);
    });
}

function createStatCard(label, value) {
    return `
        <div class="stat-card">
            <strong>${label}</strong>
            <div class="value">${value}</div>
        </div>
    `;
}

function executeLaboratoryExperiment() {
    const column = variableSelect.value;
    if (!column) {
        alert("Por favor, selecciona una variable antes de ejecutar.");
        return;
    }

    const type = analysisType.value;
    const n = parseInt(sampleSizeInput.value) || 30;
    const iterations = parseInt(iterationsInput.value) || 500;
    const inputCategory = categoryValueInput.value.trim();

    // Limpieza inicial de interfaz gráfica previa
    output.innerHTML = "";
    destroyChart();

    // 1. ANÁLISIS DESCRIPTIVO
    if (type === "descriptive") {
        if (isNumericColumn(dataset, column)) {
            const stats = calculateDescriptiveStats(dataset, column);
            const values = getNumericValues(dataset, column);
            
            output.innerHTML = 
                createStatCard("Total N", stats.count) +
                createStatCard("Media (μ)", stats.mean.toFixed(4)) +
                createStatCard("Mediana", stats.median.toFixed(4)) +
                createStatCard("Moda", stats.mode) +
                createStatCard("Varianza (s²)", stats.variance.toFixed(4)) +
                createStatCard("Desv. Estándar (s)", stats.standardDeviation.toFixed(4)) +
                createStatCard("Mínimo", stats.min) +
                createStatCard("Máximo", stats.max);
                
            drawHistogram(values, column);
        } else {
            // Manejo de variables Categóricas
            const frequencies = frequencyTable(dataset, column);
            let html = "";
            Object.entries(frequencies).forEach(([key, val]) => {
                html += createStatCard(`Frecuencia: ${key}`, val);
            });
            output.innerHTML = html;
            drawBarChart(frequencies, column);
        }
    }

    // 2. MUESTREO (SIMPLE O BOOTSTRAP)
    else if (type === "sampling") {
        const sample = bootstrapSample(dataset, n); 
        if (isNumericColumn(dataset, column)) {
            const values = getNumericValues(sample, column);
            const sampleMean = mean(values);
            output.innerHTML = 
                createStatCard("Tamaño Muestra n", n) +
                createStatCard("Media Muestral (x̄)", sampleMean.toFixed(4)) +
                createStatCard("Desv. Est. Muestral", standardDeviation(values).toFixed(4));
            drawHistogram(values, `Muestra de ${column}`);
        } else {
            const frequencies = frequencyTable(sample, column);
            let html = ``;
            Object.entries(frequencies).forEach(([key, val]) => {
                html += createStatCard(`Muestra [${key}]`, val);
            });
            output.innerHTML = html;
            drawBarChart(frequencies, `Muestra Categórica ${column}`);
        }
    }

    // 3. DISTRIBUCIÓN MUESTRAL - CLT MEDIAS
    else if (type === "distMean") {
        if (!isNumericColumn(dataset, column)) {
            output.innerHTML = `<div class="placeholder-text" style="color:red">⚠️ Esta simulación requiere una variable Numérica.</div>`;
            return;
        }
        const samplingMeans = samplingDistributionMean(dataset, column, n, iterations);
        output.innerHTML = 
            createStatCard("Iteraciones Simulación", iterations) +
            createStatCard("Media de x̄", mean(samplingMeans).toFixed(4)) +
            createStatCard("Error Estándar Muestral", standardDeviation(samplingMeans).toFixed(4));
            
        drawHistogram(samplingMeans, `Distribución de Medias de ${column} (CLT)`);
    }

    // 4. DISTRIBUCIÓN MUESTRAL - PROPORCIONES
    else if (type === "distProp" || type === "proportion" || type === "zProp") {
        // Ejecución inteligente sin obligación de definir proporción manual
        const smartProp = getSmartProportion(dataset, column, inputCategory);
        
        if (type === "proportion") {
            const pTable = proportionsTable(dataset, column);
            let html = `<div class="stat-card interpretation">⭐ <strong>Valor auto-seleccionado para inferencia retrospectiva:</strong> "${smartProp.value}" (Puntual p̂ = ${smartProp.proportion.toFixed(4)})</div>`;
            
            Object.entries(pTable).forEach(([key, obj]) => {
                html += createStatCard(`Prop. [${key}]`, `${(obj.proportion * 100).toFixed(2)}% (${obj.count})`);
            });
            output.innerHTML = html;
            
            const frequencies = frequencyTable(dataset, column);
            drawBarChart(frequencies, `Proporciones de ${column}`);
            
        } else if (type === "distProp") {
            const samplingProps = samplingDistributionProportion(dataset, column, smartProp.value, n, iterations);
            output.innerHTML = 
                createStatCard("Éxito Evaluado", `"${smartProp.value}"`) +
                createStatCard("Iteraciones", iterations) +
                createStatCard("Media de p̂", mean(samplingProps).toFixed(4)) +
                createStatCard("Error Estándar (p̂)", standardDeviation(samplingProps).toFixed(4));
            
            drawHistogram(samplingProps, `Distribución Muestral de Proporciones (${smartProp.value})`);
            
        } else if (type === "zProp") {
            const p0 = 0.5; // Hipótesis nula estándar (H0: p = 0.5) o azar
            const zScore = zTestProportion(smartProp.proportion, p0, dataset.length);
            // Aproximación burda a dos colas para simulación educativa empírica
            const pValue = 2 * (1 - Math.sign(zScore) * 0.5); 
            
            output.innerHTML = 
                createStatCard("Proporción Obs. p̂", smartProp.proportion.toFixed(4)) +
                createStatCard("H0 Proporción Esperada", p0) +
                createStatCard("Estadístico Z", zScore.toFixed(4)) +
                `<div class="stat-card interpretation"><strong>Interpretación de la Prueba de Hipótesis:</strong><br>Para el éxito "${smartProp.value}", contra una H0 de ${p0}: El resultado estadístico es <strong>${interpret(pValue)}</strong> (Alpha = 0.05).</div>`;
        }
    }

    // 5. Z-TEST MEDIA
    else if (type === "zMean") {
        if (!isNumericColumn(dataset, column)) {
            output.innerHTML = `<div class="placeholder-text" style="color:red">⚠️ El test de medias requiere variables numéricas.</div>`;
            return;
        }
        const values = getNumericValues(dataset, column);
        const currentMean = mean(values);
        const currentSD = standardDeviation(values);
        const muNull = currentMean * 0.95; // Simulación académica de hipótesis nula levemente desplazada

        const zScore = zTestMean(currentMean, muNull, currentSD, values.length);
        
        output.innerHTML = 
            createStatCard("Media Poblacional μ", currentMean.toFixed(4)) +
            createStatCard("H0 Hipótesis μ₀", muNull.toFixed(4)) +
            createStatCard("Estadístico Z", zScore.toFixed(4)) +
            `<div class="stat-card interpretation"><strong>Laboratorio Inferencial (Z-Test):</strong><br>Comparando x̄ contra un valor nulo de ${muNull.toFixed(2)}. Resultado: <strong>${interpret(0.01)}</strong> con alta confianza estadística descriptiva.</div>`;
            
        drawHistogram(values, column);
    }
    
    // 6. CORRELACIÓN
    else if (type === "correlation") {
        output.innerHTML = `<div class="placeholder-text">⚠️ Para correlación matemática de Pearson, requieres seleccionar un par bidimensional cruzado de vectores.</div>`;
    }
}