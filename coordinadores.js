document.addEventListener("DOMContentLoaded", () => {
    cargarMetricasDashboard();

    document.getElementById("btn-reiniciar").addEventListener("click", async () => {
        if (!confirm("¿Estás seguro de que quieres borrar todo el historial de consultas? Esta acción no se puede deshacer.")) return;

        try {
            const respuesta = await fetch(`${API_BASE_URL}/api/chat/reiniciar-dashboard`, {
                method: "DELETE"
            });

            if (respuesta.ok) {
                alert("¡Historial puesto a cero con éxito!");
                cargarMetricasDashboard();
            } else {
                alert("Error al intentar reiniciar el historial.");
            }
        } catch (error) {
            console.error(error);
            alert("Fallo de conexión con el servidor.");
        }
    });
});

async function cargarMetricasDashboard() {
    try {
        const respuesta = await fetch(`${API_BASE_URL}/api/chat/dashboard`);
        if (!respuesta.ok) throw new Error("Error HTTP");

        const datos = await respuesta.json();

        document.getElementById("num-total-consultas").innerText = datos.totalConsultas;
        document.getElementById("num-resueltas-bd").innerText = datos.resueltasPorBD;
        document.getElementById("num-resueltas-ia").innerText = datos.resueltasPorIA;
        document.getElementById("num-total-tokens").innerText = datos.totalTokens;
        document.getElementById("txt-eficiencia").innerText = datos.porcentajeEficiencia + "%";

        const listaPreguntas = document.getElementById("lista-preguntas-repetidas");
        listaPreguntas.innerHTML = "";

        if (datos.preguntasMasRepetidas.length === 0) {
            listaPreguntas.innerHTML = "<li>No se han detectado consultas delegadas a la IA todavía.</li>";
            return;
        }

        datos.preguntasMasRepetidas.forEach(item => {
            const fila = document.createElement("li");

            const textoPregunta = document.createElement("span");
            textoPregunta.innerHTML = `Pregunta del usuario: <strong>"${item.pregunta}"</strong>`;

            const badgeContador = document.createElement("span");
            badgeContador.classList.add("badge");
            badgeContador.innerText = `${item.repeticiones} repeticiones`;

            fila.appendChild(textoPregunta);
            fila.appendChild(badgeContador);
            listaPreguntas.appendChild(fila);
        });

    } catch (error) {
        console.error(error);
        document.getElementById("lista-preguntas-repetidas").innerHTML = "<li>Error al conectar con la API de control.</li>";
    }
}