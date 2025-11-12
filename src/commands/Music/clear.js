const CommandResponse = require("../../components/ui/CommandResponse");

module.exports = {
  name: "clear",
  aliases: ["clearqueue"],
  description: `Clear song in queue!`,
  category: "Music",
  cooldown: 5,
  inVc: true,
  sameVc: true,
  premium: false,
  dj: true,
  
  run: async (client, message, args, prefix, player) => {
    if (!player) {
      const response = CommandResponse.createErrorResponse(
        "No Player Found",
        "No Player Found For This Guild!"
      );
      return message.channel.send(response);
    }

    const queueLength = player.queue.length || 0;
    await player.queue.clear();

    const response = CommandResponse.createSuccessResponse(
      "Queue Cleared",
      `Queue has been: **Cleared**\nRemoved \`${queueLength}\` song(s) from the queue.`
    );

    return message.reply(response);
  },
};
