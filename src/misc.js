const commands = require("../resources/help.json");

/**
 * Devuelve la ayuda de uso del bot
 */
function showHelp(message) {
    text = "**Lista de comandos:**\n";

    for (var i = 0; i < commands.commandList.length; i++) {
        text += "- **" + commands.commandList[i].name + "**: ";
        text += commands.commandList[i].description + "\n";
    }

    message.reply(text);
}

module.exports = {showHelp};