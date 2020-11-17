const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`tamo redi como ${client.user.tag}!`);
  });

client.on('message', msg => {
    if (msg.content === 'ping') {
      msg.reply('Pong!');
    }
  });

client.login('Nzc4MjQzNjQ2ODcyMjIzNzc2.X7PJ4A.G0aDjFOmMuDRZ2eiEmhn8Dht9wU');
