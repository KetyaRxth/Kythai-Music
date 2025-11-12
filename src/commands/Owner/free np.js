const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "sendnoprefix",
  aliases: ["npbutton"],
  category: "owner",
  run: async (client, message) => {
    if (message.author.id !== "1383706658315960330") return;

    const channel = message.guild.channels.cache.get("1425840067829694596");
    if (!channel) return message.reply("Channel not found.");

    const embed = new EmbedBuilder()
      .setTitle("🎁 No Prefix Reward")
      .setDescription("Click the button below to claim **7 days** of No Prefix access.\n> *You can only claim this once.*")
      .setColor(client.color)
      .setFooter({ text: "Offered by Floovi", iconURL: client.user.displayAvatarURL() });

    const btn = new ButtonBuilder()
      .setCustomId("redeem_noprefix")
      .setLabel("Redeem No Prefix Access")
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(btn);

    await channel.send({ embeds: [embed], components: [row] });
    message.reply("✅ Button sent.");
  }
};