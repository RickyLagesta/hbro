const player = require("./src/player.js");
const misc = require("./src/misc.js");
const discord = require("./src/required.js");

/**
 * Método principal que lee los comandos escritos en chat
 */
discord.client.on("message", async message => {
    if (message.author.bot) {
        return;
    }

    if (!message.content.startsWith(discord.prefix)) {
        return;
    }

    const serverQueue = discord.queue.get(message.guild.id);

    console.log(message.content.split(" ")[0]);
    switch (message.content.split(" ")[0]) {
        case `${discord.prefix}play`:
            player.preparePlay(message, serverQueue);
            break;
        case `${discord.prefix}skip`:
            player.skip(message, serverQueue);
            break;
        case `${discord.prefix}stop`:
            player.stop(message, serverQueue);
            break;
        case `${discord.prefix}help`:
            misc.showHelp(message);
            break;
        default:
            message.channel.send("dilo bien o me enfado");
    }
});

// ----------------------------
// || COMANDOS DE DESARROLLO ||
// ----------------------------

discord.client.once("ready", () => {
    console.log("tamo redi!");
});

discord.client.once("reconnecting", () => {
    console.log("Reconnecting!");
});

discord.client.once("disconnect", () => {
    console.log("Disconnect!");
});

/**
 * Llamada al login con el token de discord 
 */
discord.client.login(discord.token);
