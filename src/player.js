const discord = require("./required.js");

// Variables requeridas para el funcionamiento del bot
const ytdl = require("ytdl-core");
const search = require('youtube-search');
const opts = {
    maxResults: 10,
    key: discord.YOUTUBE_API,
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
        return message.channel.send("o te vienes o no pongo nada, parvo");
    }

    // Si no se tienen permisos, salir
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send("I need the permissions to join and speak in your voice channel!");
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

            discord.queue.set(message.guild.id, queueContruct);

            queueContruct.songs.push(song);

            try {
                var connection = await voiceChannel.join();
                queueContruct.connection = connection;
                play(message.guild, queueContruct.songs[0]);
            } catch (err) {
                console.log(err);
                discord.queue.delete(message.guild.id);
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
    const serverQueue = discord.queue.get(guild.id);

    if (!song) {
        serverQueue.voiceChannel.leave();
        discord.queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection.play(ytdl(song.url)).on("finish", () => {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
    }).on("error", error => console.error(error));

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

    let results = await search(message.content, opts).catch(err => console.log(err));
    if (results) {
        let youtubeResults = results.results;
        let i = 0;
        let titles = youtubeResults.map(result => {
            i++;
            return i + ") " + result.title;
        });

        message.channel.send(titles).catch(err => console.log(err));

        filter = m => (m.author.id === message.author.id) && m.content >= 1 && m.content <= youtubeResults.length;
        let collected = await message.channel.awaitMessages(filter, { max: 1 });
        let selected = youtubeResults[collected.first().content - 1];

        // Se llama a play()
        message.channel.send(selected.link);
        message.content = `${discord.prefix}play ` + selected.link;
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