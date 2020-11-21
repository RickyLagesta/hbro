const gobals = require("./globals.js");
const commands = require("../resources/help.json");
const globals = require("./globals.js");
 
const reddit = require('reddit');

const redditApi = new reddit({
  username: globals.apiAccess.reddit.username,
  password: globals.apiAccess.reddit.password,
  appId: globals.apiAccess.reddit.appId,
  appSecret: globals.apiAccess.reddit.appSecret,
  userAgent: 'LonDiscordBot/1.0.0 (http://lonyelon.xyz)'
});


/**
 * Elimina el número indicado de mensajes
 * 
 * @param {*} message 
 */
async function clear(message) {
    const args = message.content.split(" ");

    try {
        await message.channel.messages.fetch({ limit: parseInt(args[1] + 1) }).then(messages => {
            message.channel.bulkDelete(messages);
        });
    } catch (err) {
        console.log(err);
        message.reply("O eres tonto o te pasaste con el número");
    }
}

/**
 * Envía los post de un subreddit
 * 
 * @param message 
 */
async function dumpReddit(message) {
    const args = message.content.split(" ");

    if (args.length < 2) {
        message.reply("Tu eres tonto o que? es: reddit {subreddit} [hot,top,new,trending]");
        return;
    }

    let filter = "hot";
    if (args.length == 3) {
        filter = args[2];
    }

    try {
        const res = await redditApi.get(`/r/${args[1]}/${filter}`, {
            g: "GLOBAL",
            limit: globals.options.reddit.limit
        });

        res.data.children.forEach(e => {
            embed = new globals.discord.MessageEmbed()
                .setTitle(e.data.title)
                .setColor(0xff0000)
                .setDescription(`Post de r/${args[1]}`)
                .setImage(e.data.url)
                .setURL("https://www.reddit.com" + e.data.permalink);
            if (e.data.url.includes(".gifv")) {
                embed.type = "gifv";
                console.log("gifv");
            }
            message.channel.send(embed);
        });
    } catch (err) {
        message.reply("Rompiste algo, no sé el qué, pero lo rompiste.");
        console.log(err);
    }
}


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

/**
 * Establece una variable de configuración
 * 
 * @param {*} message 
 */
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

module.exports = { showHelp, clear, dumpReddit, setVar };