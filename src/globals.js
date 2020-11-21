/*
    Este archivo contiene las variables globales 
    necesarias en todo el código.
*/

// Conector con la API de discord
const discord = require("discord.js");
const client = new discord.Client();

// Tokens para las  APIs
const apiAccess = require("../config.json");

// Cola de videos
const queue = new Map();

// Opciones
const options = require("../resources/options.json");

module.exports = {discord, options, client, queue, apiAccess};