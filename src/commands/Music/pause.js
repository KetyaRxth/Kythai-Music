const CommandResponse = require("../../components/ui/CommandResponse");

module.exports = {
  name: "pause",
  aliases: ["pause"],
  description: `Pause the music`,
  category: "Music",
  cooldown: 5,
  inVc: true,
  sameVc: true,
  premium: false,
  dj: true,

  run: async (client, message, args, prefix, player) => {
    if (!player) {
      const response = CommandResponse.createErrorResponse(
        "No Music Playing",
        "No music is playing right now.\nJoin a voice channel and start a song first."
      );
      return message.channel.send(response);
    }

    if (player.paused) {
      const response = CommandResponse.createWarningResponse(
        "Already Paused",
        "The music is already paused.\nUse the `" + prefix + "resume` command to continue playback."
      );
      return message.reply(response);
    }

    await player.pause(true);

    const response = CommandResponse.createSuccessResponse(
      "Music Paused",
      "Music has been successfully paused.\nUse the `" + prefix + "resume` command to play it again."
    );

    return message.reply(response);
  },
};