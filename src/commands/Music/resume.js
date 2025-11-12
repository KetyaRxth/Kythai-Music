const CommandResponse = require("../../components/ui/CommandResponse");

module.exports = {
  name: "resume",
  aliases: ["resume"],
  description: `Resume the paused music.`,
  category: "Music",
  cooldown: 5,
  inVc: true,
  sameVc: true,
  dj: true,
  premium: false,

  run: async (client, message, args, prefix, player) => {
    if (!player) {
      const response = CommandResponse.createErrorResponse(
        "No Music Playing",
        "No music is currently playing in this server.\nStart a song to use the resume command."
      );
      return message.reply(response);
    }

    if (!player.paused) {
      const response = CommandResponse.createWarningResponse(
        "Already Playing",
        "The music is already playing.\nUse the `" + prefix + "pause` command if you want to stop temporarily."
      );
      return message.reply(response);
    }

    await player.pause(false);

    const response = CommandResponse.createSuccessResponse(
      "Music Resumed",
      "Music playback has been resumed.\nSit back and enjoy the vibe!"
    );

    return message.reply(response);
  },
};