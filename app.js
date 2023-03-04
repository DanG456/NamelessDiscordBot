//Importa el paquete de discord
const Discord = require("discord.js");
//Leer escribir archivos paquete
const fs = require("fs");
//Conexion entre MongoDB y el codigo javascript
const mongoose = require("mongoose");

//Funcion para leer el contenido del archivo de niveles de json
function regresaData(url,encoding){
    return JSON.parse(fs.readFileSync("./level.json","utf-8"));
}

//Funcion para escribir la informacion en el archivo
function escribeData(data){
    fs.writeFileSync("./level.json", JSON.stringify(data))
}

//Funcion para crear un nuevo usuario y guardarlo en el archivo level.json
function creaUsuario(userID, data, serverID){
    const newUser = {
        "userID": userID,
        "exp": 1,
        "serverID": serverID
    }

    data.push(newUser); //Al arreglo de usuarios se añade el nuevo
    escribeData(data); //Se escribe el arreglo de todos los usuarios al level.json
}

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

    setInterval(async function(){
        const fetch = require("node-superfetch");

        let user = "";

        const uptime =  await fetch.get(`https://decapi.me/twitch/uptime/${user}`);

        const avatar =  await fetch.get(`https://decapi.me/twitch/avatar/${user}`);

        const viewers =  await fetch.get(`https://decapi.me/twitch/viewercount/${user}`);

        const title =  await fetch.get(`https://decapi.me/twitch/title/${user}`);

        const game =  await fetch.get(`https://decapi.me/twitch/game/${user}`);

        const twitch = require("./Schemas/twitchSchema")
        let data = await twitch.findOne({user: user, title: title.body})

        if(uptime.body !== `${user} is offline`){

            const embed = new Discord.MessageEmbed()
            .setAuthor({
                "name": `${user}`,
                "iconURL": `${avatar.body}`
            })
            .setTitle(`${title.body}`)
            .setThumbnail(`${avatar.body}`)
            .setURL(`https://www.twitch.tv/${user}`)
            .addFields("Game",`${game.body}`,true)
            .addFields("Viewers", `${viewers.body}`,true)
            .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${user}-620x378.jpg`)
            .setColor("BLURPLE");

            if(!data){
                const newData = new twitch({
                    user: user,
                    title: `${title.body}`,
                });
                await client.channels.cache.get("1077615993297317960").send({content : `${user} está en directo. Ve a verlo manquear\n https://www.twitch.tv/${user}`, embeds: [embed]}); //Manda al canal indicado la información del stream
                return await newData.save()
            }
            //Si el titulo guardado en la base de datos es igual al del nuevo stream hace un return
            if(data.title === `${title.body}`){
                return;
            }
            await client.channels.cache.get("1077615993297317960").send({content : `${user} está en directo. Ve a verlo manquear\n https://www.twitch.tv/${user}`, embeds: [embed]}); //Manda al canal indicado la información del stream
            await twitch.findOneAndUpdate({user: user},{title: title.body})
        }
    }, 60000);
});

//Conexion con MongoDB
mongoose.connect("mongodb+srv://danielgil1922:6Q7oIQofbqmhFP0S@cluster0.qhdualu.mongodb.net/test", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()=>{
    console.log("Conectado correctamente a MongoDB");
}).catch(()=>{
    console.log("Hubo un error al realizar la conexion con MongoDB");
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
        msg.reply(`Hola ${msg.author.username}`);
    }

    //Comando !help
    else if(lowercomm == "!help"){
        msg.reply("El bot por ahora solo tiene los comandos. \n !hola: Para saludar \n !help: Muestra la lista de comandos\n !level: Muestra tu nivel en el servidor");
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

    let data = regresaData();

    //Indica si la informacion es incorrecta en el archivo level.json
    if(data == undefined){
        console.log("Informacion incorrecta en el archivo level.json")
        return;
    }

    //ID del propietario de un mensaje
    const authorID = msg.author.id.toString();

    //ID del servidor donde se escribio el mensaje
    const servID = msg.guild.id.toString();

    //Comando para mostrar el nivel y la experiencia en el server
    if(msg.content.toLowerCase() == '!level'){
        const arrayLevels = [5,25,50,100,300,1000,3000,5000,10000];

        //Ciclo para pasar por todos los elementos dentro del archivo level.json
        for(let i=0; i<data.length; i++){
            //Revisa si coincide el ID registrado en el json con el ID del autor del mensaje enviado
            if(data[i].userID == authorID && data[i].serverID == servID){
                //Ciclo que pasa por los objetos dentro del arreglo arrayLevels
                for(let j = 0; j<arrayLevels.length; j++){
                    //Compara la experiencia del usuario con el valor actual del arreglo arrayLevels para mostrar su nivel y la necesaria para el nivel que sigue
                    if(data[i].exp < arrayLevels[j]){
                        msg.reply(`Tu nivel actual es `+ (j + 1) + '\n Para el siguiente nivel necesitas ' + (arrayLevels[j] - data[i].exp) + ' de experiencia');
                        return;
                    }
                }
            }
        }
    }

    if(data.length > 0){
        //Verificacion de si el usuario existe para incrementar su experiencia 
        let exist = false;

        for(let i=0; i<data.length; i++){
            if(data[i].userID == authorID && data[i].serverID == servID){//Verifica si el usuario existe en el archivo de level.json
                exist = true;

                //Añade 1 de experiencia y escribe el valor en el archivo level.json
                data[i].exp++;
                escribeData(data);
                return; //detiene el metodo messageCreate y detiene la ejecución de cualquier codigo posterior
            }
        }
        //Crea un nuevo objeto de usuario si no se encontro registrado en el level.json previamente
        if(exist == false){
            creaUsuario(authorID, data, servID);
        }
    
    //En caso de que el archivo este vacio crea el nuevo objeto usuario
    }else if(data.length <= 0){
        
        creaUsuario(authorID, data, servID);
    }

});

//Se hace login al bot con el token
Client.login(token);

/*Id's de canales de texto del servidor de pruebas

general: 1077615993297317960
bienvenida: 1077786124950446160
admin: 1077786179275067432

*/
