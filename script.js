// Simulación de tu BD QUIPUX
const data = {
    solicitud: [ /* Aquí tus objetos con id_solicitud, estado, etc. */ ],
    funcionario: [ /* Tus funcionarios */ ]
};

// Ejemplo: Tu consulta de carga por funcionario convertida a JS
function getWorkload() {
    return data.solicitud.reduce((acc, sol) => {
        const name = data.funcionario.find(f => f.id === sol.id_funcionario_gestor)?.nombre;
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {});
}
