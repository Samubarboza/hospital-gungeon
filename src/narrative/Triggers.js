// triggers.js
// Manejo de eventos que disparan narrativas

import { obtenerNarrativa } from "./narrative.system.js";

function triggerEvento(evento) {
  switch (evento) {
    case "inicio":
      console.log(obtenerNarrativa("inicio"));
      break;
    case "colision":
      console.log("¡Has chocado con un enemigo!");
      break;
    case "item":
      console.log("Has recogido un objeto.");
      break;
    case "victoria":
      console.log(obtenerNarrativa("victoria"));
      break;
    case "derrota":
      console.log(obtenerNarrativa("derrota"));
      break;
    default:
      console.log("Evento no reconocido.");
  }
}

// Ejemplo de uso
triggerEvento("inicio");
triggerEvento("victoria");
