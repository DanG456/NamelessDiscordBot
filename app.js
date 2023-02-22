//Importa el paquete de discord
const Discord = require("discord.js");

//Crea un nuevo cliente
const Client = new Discord.Client({
    intents: [
                Discord.Intents.FLAGS.DIRECT_MESSAGES,
                Discord.Intents.FLAGS.GUILD_MEMBERS,
                Discord.Intents.FLAGS.GUILD_MESSAGES, 
                Discord.Intents.FLAGS.GUILDS,
    ],
    //Los partials se aseguran de que recibiremos toda la información regresada por el objeto en los "Eventos"
    partials: [
        'Channel',
        'guildMember',
        'Message',
        'User'
    ]
});
//Importa la contraseña para el bot desde su archivo correspondiente
const { token } = require("./token.json")

//Despliega el mensaje cuando se inicia el bot
Client.on("ready", () => {
    console.log(`El bot ${Client.user.tag} esta ahora en linea`);
});

//Reconexion
Client.on("reconnecting", () =>{
   console.log(`El bot se esta reconectando:  ${client.user.tag}`) 
});

//Desconexion
Client.on("disconnect", () =>{
    console.log(`El bot:  ${client.user.tag} esta desconectado`); 
 });

//Revisa los mensajes para identificar los comandos
Client.on("messageCreate", msg => {
    const lowercomm = msg.content.toLowerCase();

    //Manda respuesta cuando el comando se ha escrito
    if(lowercomm == "!hola"){ //Respuesta al comando Hola
        msg.reply("Hola mundo :D");
    }

    //Comando !help
    else if(lowercomm == "!help"){
        msg.reply("El bot por ahora solo tiene dos comandos. \n !hola: Para saludar \n!help: Muestra la lista de comandos")
    }
});

//Funcion para manejar la union de usuarios al servidor
Client.on("guildMemberAdd",guildMember => {
    //No mostrara el mensaje cuando el usuario sea un bot
    if(guildMember.user.bot == true){
        return;
    }
    else{
        //Envía mensaje de saludo por unirse al servidor
        guildMember.send("Bienvenido al servidor: "+ guildMember.guild.name + "\n No olvides pasarte por el canal de reglas y por el de roles.")
    }

    //Mostrar mensaje en un canal de bienvenida
    guildMember.guild.channels.fetch('1077786124950446160').then(channel => channel.send(`Bienvenido al servidor <@: ${guildMember.id} >`)).catch(console.error);

    //Escribir un mensaje en el canal de administrador (Servidor pruebas)
    guildMember.guild.channels.fetch('1077786179275067432').then(channel => channel.send(`Un nuevo miembro ha llegado`+ guildMember.user.tag)).catch(console.error);

});

//Funciones para responder automaticamente a ciertos mensajes
Client.on("messageCreate", msg => {
    if(msg.author.bot == true){
        return;
    }

    if(msg.content.toLowerCase() == 'que' || msg.content.toLowerCase() == '¿que?' || msg.content.toLowerCase() == 'que?' ){
        msg.reply("so")
    }
    
    if(msg.content.toLocaleLowerCase() == '!channelsid'){
        //Obtener los ID de los canales del servidor
    msg.guild.channels.fetch().then(channels => console.log(channels)).catch(console.error);
    }
});

//Se hace login al bot con el token
Client.login(token);

/*Id's de canales de texto del servidor de pruebas

general: 1077615993297317960
bienvenida: 1077786124950446160
admin: 1077786179275067432

*/
