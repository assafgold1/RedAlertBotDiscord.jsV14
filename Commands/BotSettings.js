const Discord = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB({ table: "redAlerts" });

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("setchannel")
        .setDescription("Set the alerts channel")
        .setDefaultMemberPermissions(Discord.PermissionFlagsBits.Administrator)
        .addChannelOption(option => option.setName('redalert').setDescription('Red alerts Channel').addChannelTypes(Discord.ChannelType.GuildText)),

    async execute(interaction, Client) {
        try {
            const { options, channel, guild}
            interaction.reply({ content: `sucssesfuly registerd channel for red alerts in ${Channel}`, ephemeral: true });
        } catch(err) { console.error(err) }
    }
}
