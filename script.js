let chatAbierto = false;
let enModoQuiz = false;
let preguntaActual = 0;
let puntuacion = 0;
let historialConversacion = [];


let botonEnReproduccion = null;

const inputUsuario = document.getElementById('input-usuario');
const botonEnviar = document.getElementById('boton-enviar');
   // Despierta el servidor (Render Free se duerme tras un rato sin uso) en cuanto se carga la página
   window.addEventListener('load', () => {
       fetch(`${API_BASE_URL}/api/Chat/ping`).catch(() => {});
   });

const preguntasQuiz = [
    {
        q: "¿Cuál es el animal que sirve como mascota oficial del club y le da vida a este chatbot?",
        a: ["Un monstruo amigable", "Un león Valiente", "Un espantapajaros inteligente", "Un robot amoroso"],
        c: 0
    },
    {
        q: "¿Cuáles son los dos colores institucionales que predominan en el escudo y equipación del C.D. Malilla?",
        a: ["Blanco y Negro", "Azul y Rojo", "Verde y Rojo", "Naranja y Gris"],
        c: 2
    },
    {
        q: "¿Dónde disputa el C.D. Malilla todos sus partidos y entrenamientos como local?",
        a: ["Estadio de Mestalla", "Campo de Fútbol Municipal de Malilla", "Ciudad Deportiva de Paterna", "Campos del Río Turia"],
        c: 1
    },
    {
        q: "¿Qué contenido comparte principalmente el C.D. Malilla en sus redes sociales oficiales como Instagram o Facebook?",
        a: ["Cotilleos y noticias de los futbolistas famosos de primera división", "Venta de videojuegos y consolas", "Resultados de la lotería nacional", "Fotos de las jornadas, crónicas de los partidos, eventos y comunicados de la escuela"],
        c: 3
    },
    {
        q: "¿De qué material es el terreno de juego del Campo Municipal de Malilla donde entrenan todos los equipos?",
        a: ["Arena y tierra batida", "Césped artificial de última generación", "Parqué de madera", "Cemento pulido"],
        c: 1
    },
    {
        q: "¿Cuál es la categoría de fútbol base mas joven de la escuela del C.D Malilla, donde los niños empiezan a dar sus primeros toques al balón?",
        a: ["Cadete", "Infantil", "Querubín", "Senior"],
        c: 2
    },
    {
        q: "Si un jugador insulta a un árbitro o a un rival durante un partido, ¿qué medida tomará el club?",
        a: ["Se le sanciona firmemente priorizando el respeto y la deportividad", "Se le premia si el equipo consigue ganar el partido", "No se hace nada porque el fútbol es un deporte de mucha tensión", "Se culpa al equipo rival por provocar"],
        c: 0
    },
    {
        q: "En qué periodo del año se abre habitualmente el proceso de inscripciones para nuevas altas?",
        a: ["En Navidad", "Entre los meses de mayo y junio", "En Semana Santa", "Todos los días del año"],
        c: 1
    },
    {
        q: "Además de la liga regular, ¿qué actividades organiza el club en vacaciones escolares?",
        a: ["Cursos de cocina", "Clases de matemáticas", "Excursiones de alta montaña", "Campus de tecnificación y torneos especiales"],
        c: 3
    },
    {
        q: "¿Es obligatorio vestir la ropa oficial del C.D. Malilla durante los entrenamientos entre semana?",
        a: ["No, cada uno puede entrenar con la camiseta del equipo profesional que prefiera", "Sí, es obligatorio acudir con la ropa de entrenamiento oficial del club para mantener la identidad de escuela", "Solo es obligatorio si el entrenamiento es de noche", "Se puede ir a entrenar en vaqueros y camisa"],
        c: 1
    }
];

function validarEntrada() {
    if (enModoQuiz) return; 

    if (inputUsuario.value.trim().length > 0) {
        botonEnviar.disabled = false;
    } else {
        botonEnviar.disabled = true;
    }
}

inputUsuario.addEventListener('input', validarEntrada);
botonEnviar.addEventListener('click', enviarMensaje);

function evaluarTecla(event) {
    if (event.key === "Enter" && !botonEnviar.disabled) {
        enviarMensaje();
    }
}

function alternarChat() {
    const ventana = document.getElementById("ventana-chat");
    const bocadillo = document.getElementById("bocadillo-alerta");
    
    chatAbierto = !chatAbierto;
    
    if (chatAbierto) {
        ventana.classList.remove("oculto");
        bocadillo.classList.add("oculto");
        inputUsuario.focus();
    } else {
        ventana.classList.add("oculto");
        bocadillo.classList.remove("oculto");
        window.speechSynthesis.cancel();
        restaurarTodosLosBotonesAudio();
        botonEnReproduccion = null;
    }
}

function hablarTexto(textoHTML, boton) {
    
    if (botonEnReproduccion === boton) {
        window.speechSynthesis.cancel();
        restaurarTodosLosBotonesAudio();
        botonEnReproduccion = null;
        return;
    }

    
    window.speechSynthesis.cancel(); 
    restaurarTodosLosBotonesAudio();

    const divTemporal = document.createElement("div");
    divTemporal.innerHTML = textoHTML;
    const textoLimpio = divTemporal.textContent || divTemporal.innerText || "";

    const elDiscurso = new SpeechSynthesisUtterance(textoLimpio);
    const vocesDisponibles = window.speechSynthesis.getVoices();
    
    // Configuración optimizada para capturar las voces masculinas idóneas para el efecto grave
    const vozMonstruo = vocesDisponibles.find(v => v.lang.startsWith('es') && v.name.includes('David')) ||
                        vocesDisponibles.find(v => v.lang.startsWith('es') && v.name.includes('Alvaro')) ||
                        vocesDisponibles.find(v => v.lang.startsWith('es') && v.name.includes('Google') && !v.name.includes('contenta')) ||
                        vocesDisponibles.find(v => v.lang.startsWith('es') && v.name.includes('Jorge')) ||
                        vocesDisponibles.find(v => v.lang.startsWith('es'));

    if (vozMonstruo) {
        elDiscurso.voice = vozMonstruo;
    }

    
    elDiscurso.rate = 0.85; 
    elDiscurso.pitch = 0.85; 

    
    botonEnReproduccion = boton;

    
    elDiscurso.onend = () => {
        restaurarBotonAudio(boton);
        if (botonEnReproduccion === boton) {
            botonEnReproduccion = null;
        }
    };

    
    elDiscurso.onerror = () => {
        restaurarBotonAudio(boton);
        if (botonEnReproduccion === boton) {
            botonEnReproduccion = null;
        }
    };

    // Aplicamos el diseño gráfico de STOP al botón pulsado
    marcarBotonComoReproduciendo(boton);
    window.speechSynthesis.speak(elDiscurso);
}

// --- REPRODUCTOR VISUAL MINIMALISTA (ESTILO CRUZ NOVILLO) ---

function marcarBotonComoReproduciendo(boton) {
    // Icono STOP: Cuadrado limpio de 16x16 píxeles en color rojo sutil
    boton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2"></rect>
        </svg>
    `;
    boton.title = "Detener audio";
}

function restaurarBotonAudio(boton) {
    // Icono PLAY/ESCUCHAR: Línea fina vectorial de un altavoz gris estándar
    boton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
    `;
    boton.title = "Escuchar respuesta";
}

function restaurarTodosLosBotonesAudio() {
    const botones = document.querySelectorAll(".btn-audio-chat");
    botones.forEach(b => restaurarBotonAudio(b));
}

if (typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.getVoices(); };
}

function formatearMarkdownBasico(texto) {
    return texto
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>");
}


function crearBurbujaBot(texto) {
    const cuerpoChat = document.getElementById("cuerpo-chat");
    
    const contenedorMensaje = document.createElement("div");
    contenedorMensaje.style.display = "flex";
    contenedorMensaje.style.alignItems = "center";
    contenedorMensaje.style.gap = "10px";
    contenedorMensaje.style.width = "100%";
    contenedorMensaje.style.marginBottom = "12px";

    const divBot = document.createElement("div");
    divBot.classList.add("mensaje", "bot");
    divBot.innerHTML = formatearMarkdownBasico(texto);
    
    const botonAudio = document.createElement("button");
    botonAudio.classList.add("btn-audio-chat"); 
    restaurarBotonAudio(botonAudio); 
    
    botonAudio.style.background = "none";
    botonAudio.style.border = "none";
    botonAudio.style.cursor = "pointer";
    botonAudio.style.display = "flex";
    botonAudio.style.alignItems = "center";
    botonAudio.style.justifyContent = "center";
    botonAudio.style.padding = "4px";
    botonAudio.style.transition = "opacity 0.2s";
    
    botonAudio.onmouseenter = () => { botonAudio.style.opacity = "0.7"; };
    botonAudio.onmouseleave = () => { botonAudio.style.opacity = "1.0"; };
    
    botonAudio.onclick = () => hablarTexto(texto, botonAudio);

    contenedorMensaje.appendChild(divBot);
    contenedorMensaje.appendChild(botonAudio);
    cuerpoChat.appendChild(contenedorMensaje);
    cuerpoChat.scrollTop = cuerpoChat.scrollHeight;
}

function enviarMensaje() {
    const textoMensaje = inputUsuario.value.trim();
    if (textoMensaje === "") return;

    const cuerpoChat = document.getElementById("cuerpo-chat");
    
    const divUsuario = document.createElement("div");
    divUsuario.classList.add("mensaje", "usuario");
    divUsuario.textContent = textoMensaje;
    cuerpoChat.appendChild(divUsuario);

    inputUsuario.value = "";
    botonEnviar.disabled = true; 
    cuerpoChat.scrollTop = cuerpoChat.scrollHeight;

    const mensajeMinuscula = textoMensaje.toLowerCase();
    if (mensajeMinuscula.includes("trivial") || mensajeMinuscula.includes("quiz")) {
        preguntarConfirmacionQuiz();
        return;
    }

    document.getElementById("imagen-mascota").src = "MalyThinking.png";
    const tiempoInicio = Date.now();

    // Si el servidor tarda (Render lo duerme tras un rato sin uso), avisamos al usuario
    let avisoDespertar = null;
    const temporizadorAviso = setTimeout(() => {
        avisoDespertar = document.createElement("div");
        avisoDespertar.classList.add("mensaje", "bot");
        avisoDespertar.textContent = "Un momento, que me estoy despertando... ☕";
        cuerpoChat.appendChild(avisoDespertar);
        cuerpoChat.scrollTop = cuerpoChat.scrollHeight;
    }, 6000);

    fetch(`${API_BASE_URL}/api/Chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            mensaje: textoMensaje,
            historial: historialConversacion
        })
    })
    .then(response => {
        if (!response.ok) throw new Error("Error en el servidor");
        return response.json();
    })
    .then(data => {
        const tiempoTranscurrido = Date.now() - tiempoInicio;
        const tiempoEsperaRestante = Math.max(0, 1500 - tiempoTranscurrido);

        setTimeout(() => {
            crearBurbujaBot(data.respuesta);
            document.getElementById("imagen-mascota").src = "MalyIdle.png";

            historialConversacion.push({ role: "user", content: textoMensaje });
            historialConversacion.push({ role: "assistant", content: data.respuesta });

            if (historialConversacion.length > 6) {
                historialConversacion.shift();
                historialConversacion.shift();
            }
        }, tiempoEsperaRestante);
    })
    .catch(error => {
        console.error(error);
        setTimeout(() => {
            const divError = document.createElement("div");
            divError.classList.add("mensaje", "bot");
            divError.textContent = "Upps... Parece que tengo problemas de conexión con el servidor del Malilla.";
            cuerpoChat.appendChild(divError);
            cuerpoChat.scrollTop = cuerpoChat.scrollHeight;
            document.getElementById("imagen-mascota").src = "MalyIdle.png";
        }, 1500);
    })
    .finally(() => {
        clearTimeout(temporizadorAviso);
        if (avisoDespertar) avisoDespertar.remove();
    });
}


function preguntarConfirmacionQuiz() {
    enModoQuiz = true;
    inputUsuario.disabled = true;
    botonEnviar.disabled = true;
    inputUsuario.value = "";

    const cuerpoChat = document.getElementById("cuerpo-chat");
    const divBot = document.createElement("div");
    divBot.classList.add("mensaje", "bot");
    divBot.textContent = "He detectado que quieres jugar al Trivial del club. ¿Estás seguro de que quieres empezar el juego de preguntas ahora mismo?";
    cuerpoChat.appendChild(divBot);

    const contenedorOpciones = document.createElement("div");
    contenedorOpciones.classList.add("contenedor-opciones-quiz");

    const botonSi = document.createElement("button");
    botonSi.classList.add("btn-opcion-quiz");
    botonSi.textContent = "Sí, ¡vamos a jugar!";
    botonSi.onclick = () => {
        contenedorOpciones.remove();
        activarQuiz();
    };

    const botonNo = document.createElement("button");
    botonNo.classList.add("btn-opcion-quiz");
    botonNo.textContent = "No, prefiero seguir preguntando";
    botonNo.onclick = () => {
        contenedorOpciones.remove();
        
        const divCancelado = document.createElement("div");
        divCancelado.classList.add("mensaje", "bot");
        divCancelado.textContent = "¡Entendido! Cancelamos el Trivia. Puedes seguir haciéndome cualquier consulta sobre la escuela.";
        cuerpoChat.appendChild(divCancelado);
        
        enModoQuiz = false;
        inputUsuario.disabled = false;
        validarEntrada();
        cuerpoChat.scrollTop = cuerpoChat.scrollHeight;
    };

    contenedorOpciones.appendChild(botonSi);
    contenedorOpciones.appendChild(botonNo);
    cuerpoChat.appendChild(contenedorOpciones);
    cuerpoChat.scrollTop = cuerpoChat.scrollHeight;
}

function activarQuiz() {
    preguntaActual = 0;
    puntuacion = 0;
    
    const cuerpoChat = document.getElementById("cuerpo-chat");
    const divBot = document.createElement("div");
    divBot.classList.add("mensaje", "bot");
    divBot.textContent = "¡Súper! Entrando al Trivial Oficial del C.D. Malilla. Te voy a hacer 10 preguntas sobre el club para ver cuánto sabes. ¡Vamos allá!";
    cuerpoChat.appendChild(divBot);
    
    setTimeout(() => {
        mostrarPreguntaQuiz();
    }, 1500);
}

function mostrarPreguntaQuiz() {
    const cuerpoChat = document.getElementById("cuerpo-chat");
    const datosPregunta = preguntasQuiz[preguntaActual];

    const divPregunta = document.createElement("div");
    divPregunta.classList.add("mensaje", "bot");
    divPregunta.innerHTML = `<strong>Pregunta ${preguntaActual + 1}/10:</strong><br>${datosPregunta.q}`;
    cuerpoChat.appendChild(divPregunta);

    const contenedorOpciones = document.createElement("div");
    contenedorOpciones.classList.add("contenedor-opciones-quiz");

    datosPregunta.a.forEach((opcion, indice) => {
        const botonOpcion = document.createElement("button");
        botonOpcion.classList.add("btn-opcion-quiz");
        botonOpcion.textContent = opcion;
        botonOpcion.onclick = () => procesarRespuestaQuiz(indice, contenedorOpciones);
        contenedorOpciones.appendChild(botonOpcion);
    });

    cuerpoChat.appendChild(contenedorOpciones);
    cuerpoChat.scrollTop = cuerpoChat.scrollHeight;
    document.getElementById("imagen-mascota").src = "MalyIdle.png";
}

function procesarRespuestaQuiz(indiceSeleccionado, contenedorBotones) {
    const cuerpoChat = document.getElementById("cuerpo-chat");
    const datosPregunta = preguntasQuiz[preguntaActual];
    
    const botones = contenedorBotones.querySelectorAll("button");
    botones.forEach(b => b.disabled = true);

    const divRespuestaUsuario = document.createElement("div");
    divRespuestaUsuario.classList.add("mensaje", "usuario");
    divRespuestaUsuario.textContent = datosPregunta.a[indiceSeleccionado];
    cuerpoChat.appendChild(divRespuestaUsuario);

    const divResultado = document.createElement("div");
    divResultado.classList.add("mensaje", "bot");

    if (indiceSeleccionado === datosPregunta.c) {
        puntuacion++;
        divResultado.textContent = "¡Correcto! ¡Muy bien jugado! 🟢";
        document.getElementById("imagen-mascota").src = "MalyIdle.png";
    } else {
        divResultado.textContent = `Fallo... 🔴 La respuesta correcta era: ${datosPregunta.a[datosPregunta.c]}`;
        document.getElementById("imagen-mascota").src = "MalyThinking.png";
    }

    cuerpoChat.appendChild(divResultado);
    cuerpoChat.scrollTop = cuerpoChat.scrollHeight;

    preguntaActual++;

    setTimeout(() => {
        if (preguntaActual < preguntasQuiz.length) {
            mostrarPreguntaQuiz();
        } else {
            finalizarQuiz();
        }
    }, 1500);
}

function finalizarQuiz() {
    const cuerpoChat = document.getElementById("cuerpo-chat");
    const divFinal = document.createElement("div");
    divFinal.classList.add("mensaje", "bot");

    let mensajeNota = "";
    if (puntuacion >= 9) {
        mensajeNota = "¡Espectacular! Eres una leyenda viviente del C.D. Malilla.";
        document.getElementById("imagen-mascota").src = "MalyIdle.png";
    } else if (puntuacion >= 5) {
        mensajeNota = "¡Aprobado! Conoces bastante bien la escuela, buen trabajo.";
        document.getElementById("imagen-mascota").src = "MalyIdle.png";
    } else {
        mensajeNota = "Madre mía... Tienes que repasar un poco la historia y los servicios del club.";
        document.getElementById("imagen-mascota").src = "MalyThinking.png";
    }

    divFinal.innerHTML = `<strong>¡Trivial Terminado!</strong><br>Tu puntuación final es: <strong>${puntuacion}/10</strong>.<br><br>${mensajeNota}<br><br>El teclado vuelve a estar disponible para tus dudas.`;
    cuerpoChat.appendChild(divFinal);
    cuerpoChat.scrollTop = cuerpoChat.scrollHeight;

    enModoQuiz = false;
    inputUsuario.disabled = false;
    validarEntrada(); 
}