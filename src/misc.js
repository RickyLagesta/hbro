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
 * @param message 
 */
async function clear(message) {
    const args = message.content.split(" ");

    try {
        await message.channel.messages.fetch({ limit: parseInt(args[1]) + 1 }).then(messages => {
            message.channel.bulkDelete(messages);
        });
    } catch (err) {
        globals.error.unknownError(message, err);
    }
}

/**
 * hace un roll de dados al estilo DnD
 * 
 * @param message 
 */
function roll(message) {
    const args = message.content.split(" ");

    let text = "```\n";
    let total = 0;

    try {
        args.shift();
        for (let i = 0; i < args.length; i++) {
            let e = args[i];

            dice = e.split("d");

            if (e.startsWith("d")) {
                dice = ["1", e.substring(1)];
            } else if (dice.length != 2) {
                globals.error.unknownError(message, new Error);
                return;
            }

            text += e + ": ";
            for (let i = 0; i < parseInt(dice[0]); i++) {
                let a = Math.floor(Math.random() * parseInt(dice[1])) + 1;
                text += a;
                total += a;
                if (i != parseInt(dice[0]) - 1) {
                    text += ", ";
                }
            }
            text += "\n";
        }

        text += "```\nResultado: **" + total + "**";

        message.channel.send(text);
    } catch (err) {
        globals.error.unknownError(message, err);
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
        globals.error.unknownError(message, err);
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

module.exports = { showHelp, clear, roll, dumpReddit, setVar };