// narrative.system.js
// Sistema básico de narrativas para un videojuego en Phaser o JS puro

// Objeto que guarda las narrativas por contexto
const narrativas = {
  inicio: [
    "¡Bienvenido al juego!",
    "Prepárate para la aventura..."
  ],
  nivel1: [
    "Has entrado al pabellon 2 de ips.",
    "Cuidado con los enemigos ocultos."
  ],
  victoria: [
    "¡Felicitaciones! Superaste el nivel.",
    "Tu habilidad está mejorando."
  ],
  derrota: [
    "Has perdido... inténtalo de nuevo.",
    "No te rindas, cada intento te acerca más."
  ]
};

// Función para obtener un mensaje según el contexto
function obtenerNarrativa(contexto) {
  if (narrativas[contexto]) {
    // Selecciona un mensaje aleatorio del contexto
    const mensajes = narrativas[contexto];
    const indice = Math.floor(Math.random() * mensajes.length);
    return mensajes[indice];
  } else {
    return "Narrativa no definida.";
  }
}

// Ejemplo de uso
console.log(obtenerNarrativa("inicio"));   // Muestra un mensaje de inicio
console.log(obtenerNarrativa("victoria")); // Muestra un mensaje de victoria
