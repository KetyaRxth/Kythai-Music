const {
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  name: "rewind",
  aliases: ["rw", "backward"],
  description: "Rewind the current track by specified seconds",
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
            .setDescription("Please provide a valid number of seconds to rewind.")
        ]
      });
    }

    const currentPosition = player.position;
    const newPosition = Math.max(0, currentPosition - (seconds * 1000));

    await player.seek(newPosition);

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(client.color)
          .setDescription(`⏪ Rewound the track by **${seconds} seconds**`)
      ]
    });
  }
};

