const CommandResponse = require("../../components/ui/CommandResponse");

module.exports = {
  name: "shuffle",
  aliases: ["shuffle"],
  description: `Shuffle the queue!`,
  category: "Music",
  cooldown: 5,
  inVc: true,
  sameVc: true,
  voteOnly: false,
  premium: false,
  dj: true,

  run: async (client, message, args, prefix, player) => {
    const queueArray = Array.isArray(player?.queue) 
      ? player.queue 
      : (player?.queue ? Array.from(player.queue) : []);
    const queueLength = queueArray.filter(track => track !== player?.queue?.current).length;

    if (!player || !queueLength) {
      const response = CommandResponse.createErrorResponse(
        "Empty Queue",
        "There's nothing in the queue to shuffle.\nAdd more songs first."
      );
      return message.reply(response);
    }

    await player.queue.shuffle();

    const response = CommandResponse.createSuccessResponse(
      "Queue Shuffled",
      `The queue has been shuffled successfully.\nEnjoy your music in a fresh random order!`
    );

    return message.reply(response);
  },
};