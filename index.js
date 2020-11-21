const gobals = require("./src/globals.js");
const player = require("./src/player.js");
const misc = require("./src/misc.js");

/**
 * Método principal que lee los comandos escritos en chat
 */
gobals.client.on("message", async message => {
    if (message.author.bot) {
        return;
    }

    if (!message.content.startsWith(gobals.options.bot.prefix)) {
        return;
    }

    const serverQueue = gobals.queue.get(message.guild.id);

    switch (message.content.split(" ")[0]) {

        // Video
        case `${gobals.options.bot.prefix}play`:
            player.preparePlay(message, serverQueue);
            break;
        case `${gobals.options.bot.prefix}skip`:
            player.skip(message, serverQueue);
            break;
        case `${gobals.options.bot.prefix}stop`:
            player.stop(message, serverQueue);
            break;
        
        // Opciones
        case `${gobals.options.bot.prefix}setvar`:
            misc.setVar(message);
            break;

        case `${gobals.options.bot.prefix}reddit`:
            misc.dumpReddit(message);
            break;

        case `${gobals.options.bot.prefix}clear`:
            misc.clear(message);
            break;

        case `${gobals.options.bot.prefix}roll`:
            misc.roll(message);
            break;
        
            // Ayuda
        case `${gobals.options.bot.prefix}help`:
            misc.showHelp(message);
            break;
        
        default:
            message.channel.send("dilo bien o me enfado");
    }
});

// ----------------------------
// || COMANDOS DE DESARROLLO ||
// ----------------------------

gobals.client.once("ready", () => {
    console.log("tamo redi!");
});

gobals.client.once("reconnecting", () => {
    console.log("Reconnecting!");
});

gobals.client.once("disconnect", () => {
    console.log("Disconnect!");
});

/**
 * Llamada al login con el token de discord 
 */
gobals.client.login(gobals.apiAccess.token);
