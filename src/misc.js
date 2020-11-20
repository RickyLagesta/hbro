const gobals = require("./globals.js");
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

function setVar(message) {
    const args = message.content.split(" ");

    if (args[1] == "reset") {
        gobals.options = require("../resources/options.json");
        return;
    }

    if (args.length != 3) {
        return message.reply("Número de argumentos incorrecto");
    }

    switch (args[1]) {
        case "bot.prefix":
            gobals.options.bot.prefix = args[2];
            break;

        case "video.searchResults":
            gobals.options.video.searchResults = parseInt(args[2]);
            console.log(gobals.options.video.searchResults);
            break;
    
        default:
            message.reply("Opción no reconocida");
            break;
    }
}

module.exports = {showHelp, setVar};