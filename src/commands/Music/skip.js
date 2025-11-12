const { MessageFlags } = require("discord.js");

// Import our new UI components
const CommandResponse = require("../../components/ui/CommandResponse");

module.exports = {
  name: "skip",
  aliases: ["s"],
  description: `Skips the song currently playing.`,
  category: "Music",
  inVc: true,
  sameVc: true,
  dj: true,

  run: async (client, message, args, prefix, player) => {
    const tick = "<:titan_tick:1425843673534562334>";
    const cross = "<:titan_crossmark:1425843965185359904>";

    if (!player) {
      const response = CommandResponse.createErrorResponse(
        "No Song Playing",
        "No song is currently playing.\nStart playing something to skip."
      );
      return message.reply(response);
    }

    if (player.paused) {
      const response = CommandResponse.createWarningResponse(
        "Player Paused",
        "You can't skip while the music is paused.\nUse `" + prefix + "resume` first."
      );
      return message.reply(response);
    }

    // Skip 1 song by default
    if (!args[0]) {
      await player.skip();
      const response = CommandResponse.createSuccessResponse(
        "Song Skipped",
        "Skipped the current song.\nPlaying the next one in the queue."
      );
      return message.reply(response);
    }

    // If skipping multiple songs
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1) {
      const response = CommandResponse.createErrorResponse(
        "Invalid Number",
        "Please provide a valid number greater than `0`."
      );
      return message.reply(response);
    }

    if (amount > player.queue.length) {
      const response = CommandResponse.createErrorResponse(
        "Not Enough Songs",
        "There aren't that many songs in the queue to skip."
      );
      return message.reply(response);
    }

    player.queue.remove(0, amount);
    player.skip();

    const response = CommandResponse.createSuccessResponse(
      "Songs Skipped",
      `Skipped \`${amount}\` song(s).\nPlaying the next one from the queue.`
    );

    return message.reply(response);
  },
};