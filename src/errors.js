function error(text, message, err) {
    console.log(err);
    message.channel.send("[ERROR] " + text);
}

function unknownError(message, err) {
    error("Error desconocido", message, err);
}

function unknownCommand(message, err) {
    error("Comando no reconocido", message, err);
}

function noVoicePermission() {
    error("Necesito permisos para entrar en el canal", message, err);
}

function userNotJoined() {
    error("o te vienes o no pongo nada, parvo", message, err);
}

function queueError() {
    error("Fallo en la cola de reprodución", message, err);
}

function searchError() {
    error("Fallo en la búsqueda de vídeos", message, err);
}

module.exports = { unknownError, unknownCommand, noVoicePermission, userNotJoined, queueError, searchError };