const {
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  name: "forward",
  aliases: ["ff", "fwd"],
  description: "Forward the current track by specified seconds",
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

    const seconds = parseInt(args[0]);
    
    if (!seconds || isNaN(seconds) || seconds < 1) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription("Please provide a valid number of seconds to forward.")
        ]
      });
    }

    const currentPosition = player.position;
    const newPosition = currentPosition + (seconds * 1000);
    const trackDuration = player.current.info.length;

    if (newPosition >= trackDuration) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription("Cannot forward beyond the track duration.")
        ]
      });
    }

    await player.seek(newPosition);

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(client.color)
          .setDescription(`⏩ Forwarded the track by **${seconds} seconds**`)
      ]
    });
  }
};

