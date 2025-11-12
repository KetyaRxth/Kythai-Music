const {
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  name: "move",
  aliases: ["mv"],
  description: "Move a track to a different position in the queue",
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

    if (!player.queue.length) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription("The queue is empty.")
        ]
      });
    }

    const fromIndex = parseInt(args[0]) - 1;
    const toIndex = parseInt(args[1]) - 1;

    if (isNaN(fromIndex) || isNaN(toIndex) || fromIndex < 0 || toIndex < 0) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription("Please provide valid queue positions.\nUsage: `?move <from> <to>`")
        ]
      });
    }

    if (fromIndex >= player.queue.length || toIndex >= player.queue.length) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription("Invalid queue position.")
        ]
      });
    }

    const track = player.queue[fromIndex];
    player.queue.splice(fromIndex, 1);
    player.queue.splice(toIndex, 0, track);

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(client.color)
          .setDescription(`✅ Moved **${track.info.title}** from position ${fromIndex + 1} to position ${toIndex + 1}`)
      ]
    });
  }
};

