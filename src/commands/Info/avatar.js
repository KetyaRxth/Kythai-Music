const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  name: "avatar",
  aliases: ["av", "pfp"],
  description: "Get a user's avatar",
  category: "Info",
  premium: false,

  run: async (client, message, args, prefix) => {
    const user = message.mentions.users.first() || message.author;
    
    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setTitle(`${user.username}'s Avatar`)
      .setImage(user.displayAvatarURL({ size: 4096, dynamic: true }))
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel("Download")
          .setStyle(ButtonStyle.Link)
          .setURL(user.displayAvatarURL({ size: 4096, dynamic: true }))
      );

    return message.reply({
      embeds: [embed],
      components: [row]
    });
  }
};

