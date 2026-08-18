// --- BASE DE DATOS SIMULADA ---
const db = {
    tipo_exencion: [
        { id_tipo_exencion: 1, nombre_exencion: "Vehículos Eléctricos" },
        { id_tipo_exencion: 2, nombre_exencion: "Diplomáticos" },
        { id_tipo_exencion: 3, nombre_exencion: "Casos Especiales / Médicos" }
    ],
    funcionario: [
        { id_funcionario: 1, nombre_funcionario: "Ana María Restrepo" },
        { id_funcionario: 2, nombre_funcionario: "Juan Carlos Mejía" }
    ],
    solicitud: [
        { id_solicitud: 1, numero_radicado: "RAD-001", id_tipo_exencion: 1, estado_solicitud: 'Aprobada', id_funcionario_gestor: 1 },
        { id_solicitud: 2, numero_radicado: "RAD-002", id_tipo_exencion: 3, estado_solicitud: 'En revision', id_funcionario_gestor: null },
        { id_solicitud: 3, numero_radicado: "RAD-003", id_tipo_exencion: 1, estado_solicitud: 'Radicada', id_funcionario_gestor: null },
        { id_solicitud: 4, numero_radicado: "RAD-004", id_tipo_exencion: 2, estado_solicitud: 'Aprobada', id_funcionario_gestor: 1 },
        { id_solicitud: 5, numero_radicado: "RAD-005", id_tipo_exencion: 1, estado_solicitud: 'Rechazada', id_funcionario_gestor: 2 },
        { id_solicitud: 6, numero_radicado: "RAD-006", id_tipo_exencion: 3, estado_solicitud: 'Aprobada', id_funcionario_gestor: 2 }
    ]
};

window.onload = function() {
    executeSQLQuery(); // Cargar la primera consulta por defecto al iniciar
};

function setQuery(queryText) {
    document.getElementById('sql-input').value = queryText;
    executeSQLQuery();
}

// Analizador y ejecutor de consultas simuladas
function executeSQLQuery() {
    const query = document.getElementById('sql-input').value.trim().toLowerCase();
    
    let results = [];
    let labelKey = "";
    let valueKey = "";

    // Detectar qué tipo de consulta analítica escribió o seleccionó el usuario
    if (query.includes("estado_solicitud") && query.includes("group by")) {
        // Conteo por estado
        const counts = {};
        db.solicitud.forEach(s => {
            counts[s.estado_solicitud] = (counts[s.estado_solicitud] || 0) + 1;
        });
        results = Object.keys(counts).map(k => ({ categoria: k, total: counts[k] }));
        labelKey = "categoria";
        valueKey = "total";
    } 
    else if (query.includes("tipo_exencion") && query.includes("group by")) {
        // Conteo por tipo de exención
        const counts = {};
        db.solicitud.forEach(s => {
            const tipo = db.tipo_exencion.find(t => t.id_tipo_exencion === s.id_tipo_exencion);
            const nombre = tipo ? tipo.nombre_exencion : 'Desconocido';
            counts[nombre] = (counts[nombre] || 0) + 1;
        });
        results = Object.keys(counts).map(k => ({ categoria: k, total: counts[k] }));
        labelKey = "categoria";
        valueKey = "total";
    } 
    else if (query.includes("funcionario") && query.includes("group by")) {
        // Carga por funcionario
        const counts = {};
        db.funcionario.forEach(f => {
            const total = db.solicitud.filter(s => s.id_funcionario_gestor === f.id_funcionario).length;
            counts[f.nombre_funcionario] = total;
        });
        results = Object.keys(counts).map(k => ({ categoria: k, total: counts[k] }));
        labelKey = "categoria";
        valueKey = "total";
    } 
    else {
        // Consulta por defecto o genérica
        results = db.solicitud.map(s => ({ categoria: s.numero_radicado, total: s.estado_solicitud }));
        labelKey = "categoria";
        valueKey = "total";
    }

    renderTableAndChart(results, labelKey, valueKey);
}

// Renderizar la tabla de datos y el gráfico de barras dinámico en paralelo
function renderTableAndChart(data, labelKey, valueKey) {
    const thead = document.querySelector('#dynamic-table thead');
    const tbody = document.querySelector('#dynamic-table tbody');
    const chartContainer = document.getElementById('chart-container');

    // 1. Llenar la Tabla
    thead.innerHTML = `<tr><th>Categoría / Elemento</th><th>Resultado / Métrica</th></tr>`;
    tbody.innerHTML = '';
    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${row[labelKey]}</td><td><strong>${row[valueKey]}</strong></td>`;
        tbody.appendChild(tr);
    });

    // 2. Generar el Gráfico de Barras visual
    chartContainer.innerHTML = '';
    
    // Encontrar el valor máximo para calcular los porcentajes de las barras
    const numericValues = data.map(item => typeof item[valueKey] === 'number' ? item[valueKey] : 1);
    const maxVal = Math.max(...numericValues, 1);

    data.forEach(item => {
        const val = typeof item[valueKey] === 'number' ? item[valueKey] : 1;
        const percentage = (val / maxVal) * 100;

        const barItem = document.createElement('div');
        barItem.classList.add('bar-item');
        barItem.innerHTML = `
            <div class="bar-label">
                <span>${item[labelKey]}</span>
                <span><strong>${item[valueKey]}</strong></span>
            </div>
            <div class="bar-track">
                <div class="bar-fill" style="width: ${percentage}%;"></div>
            </div>
        `;
        chartContainer.appendChild(barItem);
    });
}
