const { Client, GatewayIntentBits, ActivityType, Partials, EmbedBuilder, Routes, Collection } = require("discord.js");
const { REST } = require('@discordjs/rest');
const fs = require('node:fs');
const path = require('node:path');
const axios = require("axios").default;
const config = require("./config.json");
const { QuickDB } = require('quick.db');
const db = new QuickDB({ table: "redAlerts" });
const url = "https://www.oref.org.il/WarningMessages/alert/alerts.json";
const client = new Client({
    restTimeOffset: 0,
    intents: Object.keys(GatewayIntentBits),
    partials: Object.keys(Partials)
});
const commands = [];
const commandsPath = path.join(__dirname, 'Commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js')) && fs.readdirSync(commandsPath).filter(file => file.startsWith('Bot'));
//////////////////////////////////////////////////////////////////////////

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(config.TOKEN);

client.once("ready", async () => {
	console.log(`Logged in as ${client.user.tag}!`);

    const guilds = client.guilds.cache
    guilds.forEach(async g => {
        const exist = await db.get(`redalerts_${g.id}`)
        if (!exist) {
            await db.set(`redalerts_${g.id}`, { GuildId: g.id, ChannelId: "" })
            const embed = new EmbedBuilder()
                .setColor("#ff0001")
                .setTitle(`הגדרת הבוט`)
                .setDescription(`על מנת להגדיר את הבוט כיתבו בחדר את הפקודה 
                /setup 
                ובחרו את החדר שאתם רוצים שהבוט יתריע`)
                .setTimestamp();
            const OwnerId = g.ownerId
            client.users.send(OwnerId, {embeds: [embed]}).catch(err => []);
                rest.put(Routes.applicationGuildCommands(config.ClientId, g.id), { body: commands })
                .then(() => console.log('Successfully registered application commands to a new guild.' + g.id))
                .catch(console.error);
        }
    });

///////////////////////
client.on("messageCreate",async message => {
    if (message.author.id !== "411593190865633282") return
    if (message.content == "!about") {
        let embed = new EmbedBuilder()
        .setColor("#ff0001")
        .setTitle("test")
        .setDescription("test")
        .setFooter({text: '© All rights reserved to shahar levy#7023 & Corazon#6037'})
        .setThumbnail("https://cdn.discordapp.com/attachments/1086301131468177459/1093681346708246568/maxresdefault_1.jpg")
        .setTimestamp();
        console.log(`[${new Date()}] Sent message!`);
    }
    console.log(asdasdas)
})
//////////////////////////////////////////////////////////


//	client.user.setPresence({ activities: [{ name: `Iron Dome Intercepts Rockets`, type: ActivityType.WATCHING }], status: 'dnd' })
    client.user.setActivity(`Iron Dome Intercepts Rockets`, { type: ActivityType.Streaming, url: "https://www.twitch.tv/Iron Dome Intercepts Rockets" });

	let prevId = "";

	setInterval(async () => {
		await axios.get(url, {
			headers: {
				"Accept": "application/json",
				"X-Requested-With": "XMLHttpRequest",
				"Referer": "https://www.oref.org.il/12481-he/Pakar.aspx"
			},
			maxContentLength: Infinity
		})
		.then(async res => {
			if (res.data !== "" && res.data.constructor === Object) {
				let json = JSON.parse(JSON.stringify(res.data));

				if (json.id != prevId){
					prevId = json.id;

					let locations = "";

					for (let i = 0; i < json.data.length; i++) {
						locations += json.data[i] + "\n";
					}

        let embed = new EmbedBuilder()
        .setColor("#ff0001")
        .setTitle("test")
        .setDescription("test")
        .setFooter({text: '© All rights reserved to shahar levy#7023 & Corazon#6037'})
        .setThumbnail("https://cdn.discordapp.com/attachments/1086301131468177459/1093681346708246568/maxresdefault_1.jpg")

        .addFields({
            name: "יישובים",
            value: locations
        })
        .setTimestamp();

        const alldb = await db.all()
        alldb.forEach(async gg => {
            try {
                const guild = await client.guilds.fetch(gg.value.GuildId);
                const redAlertChannel = guild.channels.cache.get(gg.value.ChannelId)
                    if (redAlertChannel) {
                    let msg = await redAlertChannel.send({ embeds: [embed] });
                    await msg.react("<a:reda:1094423661986988052> ");
                  }
                 } catch (error) {
                   console.log(error);
                 }
                });    
      	  console.log(`[${new Date()}] Sent message!`);
				}
			}
		})
		.catch(err => {
			console.log(err);
		});
	}, 5000);
});






client.on("guildCreate", async guild => {
    rest.put(Routes.applicationGuildCommands(config.ClientId, guild.id), { body: commands })
	.then(() => console.log('Successfully registered application commands to a new guild.' + guild.id))
	.catch(console.error);

    await db.set(`redalerts_${guild.id}`, { GuildId: guild.id, ChannelId: "" })
    const embed = new EmbedBuilder()
        .setColor("#ff0001")
        .setTitle(`הגדרת הבוט`)
        .setDescription(`על מנת להגדיר את הבוט כיתבו בחדר את הפקודה 
        /setchannel 
        ובחרו את החדר שאתם רוצים שהבוט יתריע`)
        .setTimestamp();
    const OwnerId = guild.ownerId
    client.users.send(OwnerId, {embeds: [embed]}).catch(err => []);;
})

client.on("guildDelete", async guild => {
    await db.delete(`redalerts_${guild.id}`)
})

client.commands = new Collection();
const commandsPath1 = path.join(__dirname, 'Commands');
const commandFiles1 = fs.readdirSync(commandsPath1).filter(file => file.endsWith('.js')) && fs.readdirSync(commandsPath1).filter(file => file.startsWith('Bot'));

for (const file of commandFiles1) {
    const filePath = path.join(commandsPath1, file);
    const command = require(filePath);
    console.log(`[Log] | Commands ${file} loaded.`);
    client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) return;
	try {
		await command.execute(interaction, client);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.on("messageCreate",async message => {
    if (message.author.id !== "411593190865633282") return
    if (message.content == "!test") {
        let embed = new EmbedBuilder()
        .setColor("#ff0001")
        .setTitle("test")
        .setDescription("test")
        .setFooter({text: '© All rights reserved to shahar levy#7023 & Corazon#6037'})
        .setThumbnail("https://cdn.discordapp.com/attachments/1086301131468177459/1093681346708246568/maxresdefault_1.jpg")

        .addFields({
            name: "יישובים",
            value: "test"
        })
        .setTimestamp();

        const alldb = await db.all()
        alldb.forEach(async gg => {
            try {
                const guild = await client.guilds.fetch(gg.value.GuildId);
                const redAlertChannel = guild.channels.cache.get(gg.value.ChannelId)
                    if (redAlertChannel) {
                    let msg = await redAlertChannel.send({ embeds: [embed] });
                    await msg.react("<a:reda:1094423661986988052>");
                  }
                 } catch (error) {
                   console.log(error);
                 }
                });    
        console.log(`[${new Date()}] Sent message!`);
    }
})

client.login(config.TOKEN);