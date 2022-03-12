//Importa el paquete de discord
const Discord = require("discord.js");

//Crea un nuevo cliente
const Client = new Discord.Client()

//Despliega el mensaje cuando se inicia el bot
Client.on("ready", () => {
    console.log(`Inicio de sesión como ${Client.user.tag}!`);
});

//Reconexion
Client.on("reconnecting", () =>{
   console.log(`El bot se esta reconectando:  ${client.user.tag}`) 
});


//Desconexion
Client.on("disconnect", () =>{
    console.log(`El bot esta desconectado:  ${client.user.tag}`); 
 });

//Revisa los mensajes para identificar los comandos
Client.on("message", msg => {
    const lowercomm = msg.content.toLowerCase();

    //Manda respuesta cuando el comando se ha escrito
    if(lowercomm == "!hola"){ //Respuesta al comando Hola
        msg.reply("Hola mundo :D");
    }

    //Comando !help
    else if(lowercomm == "!help"){
        msg.reply("El bot por ahora solo tiene dos comandos. !hola y !help")
    }
});

//Se hace login al bot con el token
Client.login("token");