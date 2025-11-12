const {
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  name: "speed",
  aliases: ["tempo"],
  description: "Change the playback speed of the current track",
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

    const speed = parseFloat(args[0]);

    if (!speed || isNaN(speed) || speed < 0.25 || speed > 4.0) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription("Please provide a valid speed value between 0.25 and 4.0.\nExample: `?speed 1.5` (1.5x speed)")
        ]
      });
    }

    await player.setTimescale({ speed: speed });

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(client.color)
          .setDescription(`⚡ Playback speed set to **${speed}x**`)
      ]
    });
  }
};

