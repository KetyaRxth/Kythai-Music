const {
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  name: "pitch",
  aliases: ["tone"],
  description: "Change the pitch of the current track",
  category: "Music",
  inVc: true,
  sameVc: true,
  dj: true,
  premium: false,

  run: async (client, message, args, prefix) => {
    const player = client.manager.players.get(message.guild.id);
    
    if (!player) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription("There is no music playing right now.")
        ]
      });
    }

    const pitch = parseFloat(args[0]);

    if (!pitch || isNaN(pitch) || pitch < 0.1 || pitch > 5.0) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription("Please provide a valid pitch value between 0.1 and 5.0.\nExample: `?pitch 1.2` (higher pitch)")
        ]
      });
    }

    await player.setTimescale({ pitch: pitch });

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(client.color)
          .setDescription(`🎵 Pitch set to **${pitch}x**`)
      ]
    });
  }
};

