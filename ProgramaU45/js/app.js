let dataset = [];

// Enlace de selectores de la interfaz de usuario
const csvFile = document.getElementById("csvFile");
const variableSelect = document.getElementById("variableSelect");
const variableSelect2 = document.getElementById("variableSelect2"); // Vinculado al nuevo select del HTML
const analysisType = document.getElementById("analysisType");
const sampleSizeInput = document.getElementById("sampleSize");
const iterationsInput = document.getElementById("iterations");
const categoryValueInput = document.getElementById("categoryValue");
const muNullInput = document.getElementById("muNullInput"); // Vinculado al nuevo input numérico del HTML
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
            if (variableSelect2) variableSelect2.disabled = false; // Habilitar segundo selector si existe en el DOM
            output.innerHTML = `<div class="placeholder-text" style="color: green">✅ ${dataset.length} registros cargados exitosamente. Selecciona variables y presiona "Ejecutar".</div>`;
        } else {
            output.innerHTML = `<div class="placeholder-text" style="color: red">❌ Error al procesar el archivo CSV o formato vacío.</div>`;
        }
    };
    reader.readAsText(file);
}

function populateVariables() {
    if (!variableSelect) return;
    variableSelect.innerHTML = '';
    
    if (variableSelect2) variableSelect2.innerHTML = '';

    const columns = Object.keys(dataset[0]);
    columns.forEach(column => {
        const option = document.createElement("option");
        option.value = column;
        option.textContent = column;
        variableSelect.appendChild(option);
        
        if (variableSelect2) {
            variableSelect2.appendChild(option.cloneNode(true));
        }
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

    // 4. DISTRIBUCIONES DE PROPORCIONES Y PRUEBAS ASOCIADAS
    else if (type === "distProp" || type === "proportion" || type === "zProp") {
        const smartProp = getSmartProportion(dataset, column, inputCategory);
        
        if (type === "proportion") {
            const pTable = proportionsTable(dataset, column);
            let html = `<div class="stat-card interpretation" style="grid-column: span 2;">⭐ <strong>Valor evaluado para inferencia retrospectiva:</strong> "${smartProp.value}" (Puntual p̂ = ${smartProp.proportion.toFixed(4)})</div>`;
            
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
            // Lee p0 desde el cuadro de texto común de hipótesis; si no existe o está vacío, usa 0.5 por defecto
            const p0 = (muNullInput && muNullInput.value !== "") ? parseFloat(muNullInput.value) : 0.5;
            const zScore = zTestProportion(smartProp.proportion, p0, dataset.length);
            const pValue = 2 * (1 - (Math.abs(zScore) > 0 ? (0.5 + 0.3413) : 0.5)); // Aproximación empírica simplificada para p-valor
            
            output.innerHTML = 
                createStatCard("Proporción Obs. p̂", smartProp.proportion.toFixed(4)) +
                createStatCard("H0 Proporción Esperada (p₀)", p0) +
                createStatCard("Estadístico Z", zScore.toFixed(4)) +
                `<div class="stat-card interpretation" style="grid-column: span 2;"><strong>Interpretación de la Prueba de Hipótesis:</strong><br>Para el éxito "${smartProp.value}" contra una H₀ de ${p0}: El resultado estadístico es <strong>${interpret(pValue)}</strong> (Alpha = 0.05).</div>`;

            // Muestra el gráfico correspondiente para ver la distribución categórica observada
            const frequencies = frequencyTable(dataset, column);
            drawBarChart(frequencies, `Frecuencias de Proporción Observada en ${column}`);
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
        
        // Lee el valor dinámico introducido en el cuadro de texto. Si está vacío, usa el fallback del 95%
        const muNull = (muNullInput && muNullInput.value !== "") ? parseFloat(muNullInput.value) : (currentMean * 0.95);

        const zScore = zTestMean(currentMean, muNull, currentSD, values.length);
        const pValue = Math.abs(zScore) > 1.96 ? 0.01 : 0.10; // Mapeo crítico simplificado para control estadístico
        
        output.innerHTML = 
            createStatCard("Media Poblacional (x̄)", currentMean.toFixed(4)) +
            createStatCard("H₀ Hipótesis (μ₀)", muNull.toFixed(4)) +
            createStatCard("Estadístico Z", zScore.toFixed(4)) +
            `<div class="stat-card interpretation" style="grid-column: span 2;"><strong>Laboratorio Inferencial (Z-Test):</strong><br>Comparando la media observada contra el valor nulo de ${muNull.toFixed(4)}. Resultado: <strong>${interpret(pValue)}</strong> con nivel de significancia Alpha = 0.05.</div>`;
            
        drawHistogram(values, column);
    }
    
    // 6. CORRELACIÓN DE PEARSON (CORREGIDO)
    else if (type === "correlation") {
        if (!variableSelect2) {
            output.innerHTML = `<div class="placeholder-text" style="color:red">⚠️ No se encontró el selector 'variableSelect2' en la interfaz HTML.</div>`;
            return;
        }
        
        const columnY = variableSelect2.value;
        if (!columnY) {
            output.innerHTML = `<div class="placeholder-text" style="color:orange">⚠️ Por favor, selecciona una Variable Secundaria (Y) para calcular la correlación.</div>`;
            return;
        }

        if (!isNumericColumn(dataset, column) || !isNumericColumn(dataset, columnY)) {
            output.innerHTML = `<div class="placeholder-text" style="color:red">⚠️ La correlación matemática de Pearson requiere que AMBAS variables seleccionadas sean numéricas.</div>`;
            return;
        }

        const xValuesAll = getNumericValues(dataset, column);
        const yValuesAll = getNumericValues(dataset, columnY);

        // RESTRICCIÓN: Limitar los vectores al tamaño de muestra (n) seleccionado por el usuario
        const xValues = xValuesAll.slice(0, n);
        const yValues = yValuesAll.slice(0, n);

        // Ejecución matemática del coeficiente de asociación lineal (se calcula sobre la muestra visualizada)
        const r = correlation(xValues, yValues);
        
        let fuerza = "";
        if (Math.abs(r) >= 0.7) fuerza = "Fuerte";
        else if (Math.abs(r) >= 0.3) fuerza = "Moderada";
        else fuerza = "Débil o Nula";

        let sentido = r >= 0 ? "Positiva (+)" : "Negativa (-)";

        output.innerHTML = 
            createStatCard("Variable X", column) +
            createStatCard("Variable Y", columnY) +
            createStatCard("Coeficiente r de Pearson (Muestra)", r.toFixed(4)) +
            `<div class="stat-card interpretation" style="grid-column: span 2;">
                <strong>Análisis de Asociación Lineal (n = ${xValues.length}):</strong><br>
                En los primeros <strong>${xValues.length}</strong> registros analizados, se presenta una correlación de intensidad <strong>${fuerza}</strong> con sentido <strong>${sentido}</strong>.
             </div>`;

        // Generar Gráfico bidimensional restringido
        if (typeof drawCorrelationLineChart === "function") {
            drawCorrelationLineChart(xValues, yValues, column, columnY);
        } else {
            console.warn("La función drawCorrelationLineChart no está definida en charts.js");
        }
    }
}