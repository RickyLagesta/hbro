const Discord = require("discord.js");
const { prefix, token, YOUTUBE_API } = require("../config.json");
const client = new Discord.Client();
const queue = new Map();

module.exports = {Discord, client, queue, prefix, token, YOUTUBE_API};