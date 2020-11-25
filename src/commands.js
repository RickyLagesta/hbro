const globals = require("./globals.js");
const commands = require("../resources/help.json");
const list = require("../resources/customCommands.json");
const indexx = require("../index.js");
const player = require("./player.js");
const misc = require("./misc.js");

/**
 * Método principal que lee los comandos escritos en chat
 */
function executeCommand(message) {
    if (message.author.bot) {
        return;
    }

    if (executeCustom(message)) {
        return;
    }

    if (!message.content.startsWith(globals.options.bot.prefix)) {
        return;
    }

    const serverQueue = globals.queue.get(message.guild.id);

    switch (message.content.split(" ")[0]) {

        // Video
        case `${globals.options.bot.prefix}play`:
            player.preparePlay(message, serverQueue);
            break;
        case `${globals.options.bot.prefix}skip`:
            player.skip(message, serverQueue);
            break;
        case `${globals.options.bot.prefix}stop`:
            player.stop(message, serverQueue);
            break;
        
        // Opciones
        case `${globals.options.bot.prefix}setvar`:
            misc.setVar(message);
            break;

        case `${globals.options.bot.prefix}reddit`:
            misc.dumpReddit(message);
            break;

        case `${globals.options.bot.prefix}clear`:
            misc.clear(message);
            break;

        case `${globals.options.bot.prefix}roll`:
            misc.roll(message);
            break;

        case `${globals.options.bot.prefix}waifu`:
            misc.getWaifu(message);            
            break;
        
        // Ayuda
        case `${globals.options.bot.prefix}help`:
            misc.showHelp(message);
            break;
        
        default:
            globals.error.unknownCommand(message, new Error());
    }
}

/**
 * Comprueba si el usuario ha solicitado un comando personalizado
 * y lo ejecuta si es así.
 * 
 * @param message Mensaje del comando
 */
function executeCustom(message) {

    const args = message.content.split(" ");

    let found = false;
    let i = 0;
    for (; i < list.length; i++) {
        if ((list[i].matchtype == "command" && `${globals.options.bot.prefix}${list[i].match}` == args[0])) {
            found = true;
            break;
        }
    }

    if (!found) {
        for (i = 0; i < list.length; i++) {
            if (list[i].matchtype == "all" && args.includes(list[i].match)) {
                found = true;
                break;
            }
        }
    }

    if (found) {
        switch (list[i].type) {
            case "basic":
                message.channel.send(list[i].value);
                break;
            case "redirect/all":
                message.content = list[i].value;
                executeCommand(message);
                break;
            case "redirect/command":
                message.content = `${globals.options.bot.prefix}${list[i].value}`;
                executeCommand(message);
                break;
        } 
    }

    return found;
}

module.exports = { executeCommand };