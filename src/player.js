const gobals = require("./globals.js");

// Variables requeridas para el funcionamiento del bot
const ytdl = require("ytdl-core");
const search = require('youtube-search');
const globals = require("./globals.js");
const opts = {
    maxResults: gobals.options.video.searchResults,
    key: gobals.apiAccess.YOUTUBE_API,
    type: 'video'
};

/**
 * Prepara una canción para ser reproducida, ha de llamarse antes de play()
 * 
 * @param message       Mensaje del comando
 * @param serverQueue   Cola del servidor
 */
async function preparePlay(message, serverQueue) {
    const args = message.content.split(" ");

    // Si el usuario no está en un canal de voz, salir
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        return globals.error.userNotJoined(message, err);
    }

    // Si no se tienen permisos, salir
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return globals.error.noVoicePermission(message, err);
    }

    if (isValidUrl(args[1])) {
        // Obtener informacion de la canción
        const songInfo = await ytdl.getInfo(args[1]);
        const song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url,
        };

        if (!serverQueue) {
            const queueContruct = {
                textChannel: message.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: 5,
                playing: true
            };

            gobals.queue.set(message.guild.id, queueContruct);

            queueContruct.songs.push(song);

            try {
                var connection = await voiceChannel.join();
                queueContruct.connection = connection;
                play(message.guild, queueContruct.songs[0]);
            } catch (err) {
                globals.error.unknownError(message, err);
                return message.channel.send(err);
            }
        } else {
            serverQueue.songs.push(song);
            return message.channel.send(`${song.title} ya verá que temazo puso este a la cola`);
        }
    } else {
        youtubeSearch(message, serverQueue);
    }
}


/**
 * Reproduce un video de youtube cuando se le pasa la url
 * 
 * @param guild 
 * @param song  URL a la canción
 */
function play(guild, song) {
    const serverQueue = gobals.queue.get(guild.id);

    if (!song) {
        serverQueue.voiceChannel.leave();
        gobals.queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection.play(ytdl(song.url)).on("finish", () => {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
    }).on("error", err => globals.error.queueError(message, err));

    dispatcher.setVolumeLogarithmic(serverQueue.volume / 10);
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}

/**
 * Método privado que busca un vídeo en youtube y después lo reproduce
 * 
 * @param message 
 * @param serverQueue 
 */
async function youtubeSearch(message, serverQueue) {

    const args = message.content.split(" ");
    message.content = args.slice(1, -1).join(" ");

    opts.maxResults = gobals.options.video.searchResults;

    let results = await search(message.content, opts).catch(err => globals.error.searchError(message, err));
    if (results) {
        let youtubeResults = results.results;
        let i = 0;
        let titles = youtubeResults.map(result => {
            i++;
            return i + ") " + result.title;
        });

        message.channel.send(titles).catch(err => globals.error.unknownError(message, err));

        filter = m => (m.author.id === message.author.id) && m.content >= 1 && m.content <= youtubeResults.length;
        let collected = await message.channel.awaitMessages(filter, { max: 1 });
        let selected = youtubeResults[collected.first().content - 1];

        // Se llama a play()
        message.channel.send(selected.link);
        message.content = `${gobals.options.bot.prefix}play ` + selected.link;
        preparePlay(message, serverQueue);
    }
}


/**
 * Salta a la siguiente canción en la cola
 * 
 * @param message       Mensaje del comando
 * @param serverQueue   Cola de reproducción actual
 * 
 * @returns Un mensaje dependiendo del resultado
 */
function skip(message, serverQueue) {

    // Si el usuario no está en un chat de voz, parar
    if (!message.member.voice.channel) {
        return message.channel.send("no me grite que no te cuxo");
    }

    // Si la cola esta vacía se sale
    if (!serverQueue) {
        return message.reply("pero que dices payaso si no hay");
    }

    serverQueue.connection.dispatcher.end();
}

/**
 * Para la resproducción y limpia la cola de reproducción
 * 
 * @param message       Mensaje del comando
 * @param serverQueue   Cola del servidor
 */
function stop(message, serverQueue) {
    if (!message.member.voice.channel) {
        return message.channel.send("illo que te tiene que poné nun caná pa zoná");
    }

    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
    message.channel.send("vale ya paro");
}

/**
 * Comprueba si el argumento es o no una URL
 * 
 * @param string URL
 */
function isValidUrl(string) {
    try {
        new URL(string);
    } catch (_) {
        return false;
    }

    return true;
}


module.exports = { preparePlay, skip, stop };