// --- BASE DE DATOS SIMULADA (QUIPUX) ---
const db = {
    tipo_exencion: [
        { id_tipo_exencion: 1, nombre_exencion: "Vehículos Eléctricos", requiere_documento: true },
        { id_tipo_exencion: 2, nombre_exencion: "Diplomáticos", requiere_documento: true },
        { id_tipo_exencion: 3, nombre_exencion: "Casos Especiales / Médicos", requiere_documento: true }
    ],
    ciudadano: [
        { id_ciudadeano: 1, nombres_o_razon_social: "Carlos Andrés Pérez", numero_documento: "10203040" },
        { id_ciudadeano: 2, nombres_o_razon_social: "María Fernanda Gómez", numero_documento: "50607080" },
        { id_ciudadeano: 3, nombres_o_razon_social: "Tecnología Avanzada S.A.S.", numero_documento: "900123456" }
    ],
    vehiculo: [
        { id_vehiculo: 1, placa: "ABC-123", linea: "Zoe", es_electrico: true, id_propietario_actual: 1 },
        { id_vehiculo: 2, placa: "XYZ-789", linea: "Spark", es_electrico: false, id_propietario_actual: 2 },
        { id_vehiculo: 3, placa: "MNO-456", linea: "Leaf", es_electrico: true, id_propietario_actual: 3 }
    ],
    funcionario: [
        { id_funcionario: 1, nombre_funcionario: "Ana María Restrepo", rol: "Evaluador Senior" },
        { id_funcionario: 2, nombre_funcionario: "Juan Carlos Mejía", rol: "Auditor" }
    ],
    solicitud: [
        { id_solicitud: 1, numero_radicado: "RAD-2026-001", id_ciudadano: 1, id_vehiculo: 1, id_tipo_exencion: 1, estado_solicitud: 'Aprobada', id_funcionario_gestor: 1, fecha_radicacion: "2026-08-01" },
        { id_solicitud: 2, numero_radicado: "RAD-2026-002", id_ciudadano: 2, id_vehiculo: 2, id_tipo_exencion: 3, estado_solicitud: 'En revision', id_funcionario_gestor: null, fecha_radicacion: "2026-08-10" },
        { id_solicitud: 3, numero_radicado: "RAD-2026-003", id_ciudadano: 3, id_vehiculo: 3, id_tipo_exencion: 1, estado_solicitud: 'Radicada', id_funcionario_gestor: null, fecha_radicacion: "2026-08-15" }
    ]
};

// Inicializar el dashboard al cargar la página
window.onload = function() {
    updateMetrics();
    renderAllRequests();
};

// Actualizar las tarjetas de métricas superiores
function updateMetrics() {
    document.getElementById('metric-total').innerText = db.solicitud.length;
    document.getElementById('metric-approved').innerText = db.solicitud.filter(s => s.estado_solicitud === 'Aprobada').length;
    document.getElementById('metric-review').innerText = db.solicitud.filter(s => s.estado_solicitud === 'En revision').length;
    document.getElementById('metric-radicated').innerText = db.solicitud.filter(s => s.estado_solicitud === 'Radicada').length;
}

// 1. Consulta Básica: Ver Solicitudes
function renderAllRequests() {
    document.getElementById('table-title').innerText = "Listado General de Solicitudes (SELECT * FROM solicitud)";
    const thead = document.querySelector('#data-table thead');
    const tbody = document.querySelector('#data-table tbody');

    thead.innerHTML = `<tr><th>Radicado</th><th>Estado</th><th>Fecha Radicación</th></tr>`;
    tbody.innerHTML = '';

    db.solicitud.forEach(s => {
        const row = document.tr = document.createElement('tr');
        row.innerHTML = `<td>${s.numero_radicado}</td><td>${s.estado_solicitud}</td><td>${s.fecha_radicacion}</td>`;
        tbody.appendChild(row);
    });
}

// 2. Consulta con JOIN: Detalle completo cruzando tablas
function renderDetailedJoin() {
    document.getElementById('table-title').innerText = "Reporte Detallado de Trámite (Simulación de INNER JOIN)";
    const thead = document.querySelector('#data-table thead');
    const tbody = document.querySelector('#data-table tbody');

    thead.innerHTML = `<tr><th>Radicado</th><th>Ciudadano</th><th>Placa</th><th>Tipo Exención</th><th>Estado</th></tr>`;
    tbody.innerHTML = '';

    db.solicitud.forEach(s => {
        const ciu = db.ciudadano.find(c => c.id_ciudadeano === s.id_ciudadano);
        const veh = db.vehiculo.find(v => v.id_vehiculo === s.id_vehiculo);
        const tipo = db.tipo_exencion.find(t => t.id_tipo_exencion === s.id_tipo_exencion);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${s.numero_radicado}</td>
            <td>${ciu ? ciu.nombres_o_razon_social : 'N/A'}</td>
            <td>${veh ? veh.placa : 'N/A'}</td>
            <td>${tipo ? tipo.nombre_exencion : 'N/A'}</td>
            <td>${s.estado_solicitud}</td>
        `;
        tbody.appendChild(row);
    });
}

// 3. Consulta Analítica: Carga de trabajo por funcionario
function renderWorkload() {
    document.getElementById('table-title').innerText = "Carga de Trabajo por Funcionario (GROUP BY funcionario)";
    const thead = document.querySelector('#data-table thead');
    const tbody = document.querySelector('#data-table tbody');

    thead.innerHTML = `<tr><th>Funcionario</th><th>Rol</th><th>Trámites Gestionados</th></tr>`;
    tbody.innerHTML = '';

    db.funcionario.forEach(f => {
        const count = db.solicitud.filter(s => s.id_funcionario_gestor === f.id_funcionario).length;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${f.nombre_funcionario}</td>
            <td>${f.rol}</td>
            <td><strong>${count}</strong></td>
        `;
        tbody.appendChild(row);
    });
}

// 4. Validación de Regla de Negocio (Regla 2: Aprobadas sin gestor)
function checkBusinessRules() {
    document.getElementById('table-title').innerText = "Auditoría de Reglas de Negocio (Validando inconsistencias)";
    const thead = document.querySelector('#data-table thead');
    const tbody = document.querySelector('#data-table tbody');

    thead.innerHTML = `<tr><th>Radicado</th><th>Estado</th><th>Problema Detectado</th></tr>`;
    tbody.innerHTML = '';

    // Filtrar solicitudes aprobadas/rechazadas que no tengan funcionario gestor asignado
    const invalidas = db.solicitud.filter(s => (s.estado_solicitud === 'Aprobada' || s.estado_solicitud === 'Rechazada') && !s.id_funcionario_gestor);

    if (invalidas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #10b981;">¡Excelente! No se encontraron violaciones a la regla de negocio. Todos los trámites resueltos tienen un funcionario asignado.</td></tr>`;
    } else {
        invalidas.forEach(s => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${s.numero_radicado}</td><td>${s.estado_solicitud}</td><td style="color: #f59e0b;">Falta ID de Funcionario Gestor</td>`;
            tbody.appendChild(row);
        });
    }
}
