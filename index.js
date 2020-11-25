const globals = require("./src/globals.js");
const commands = require("./src/commands.js");

globals.client.on("message", async message => {
    commands.executeCommand(message);
});

// ----------------------------
// || COMANDOS DE DESARROLLO ||
// ----------------------------

globals.client.once("ready", () => {
    console.log("tamo redi!");
});

globals.client.once("reconnecting", () => {
    console.log("Reconnecting!");
});

globals.client.once("disconnect", () => {
    console.log("Disconnect!");
});

/**
 * Llamada al login con el token de discord 
 */
globals.client.login(globals.apiAccess.token);