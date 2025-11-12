const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "replay",
  description: `Replay the current song.`,
  category: "Music",
  cooldown: 5,
  inVc: true,
  sameVc: true,
  voteOnly: false,
  dj: true,
  premium: false,

  run: async (client, message, args, prefix, player) => {
    const tick = "<:titan_tick:1425843673534562334>";
    const cross = "<:titan_crossmark:1425843965185359904>";

    if (!player || !player.queue.current) {
      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(`${cross} | There's no song currently playing.\nPlay something first to use the replay command.`);
      return message.reply({ embeds: [embed] });
    }

    await player.seek(0);

    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setDescription(`${tick} | The song has been restarted from the beginning.\nEnjoy the track once again!`);

    return message.reply({ embeds: [embed] });
  },
};