const CommandResponse = require("../../components/ui/CommandResponse");

module.exports = {
  name: "remove",
  description: `Remove a Song From The Queue!`,
  category: "Music",
  cooldown: 5,
  inVc: true,
  sameVc: true,
  voteOnly: false,
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

    if (!args[0]) {
      const response = CommandResponse.createErrorResponse(
        "Missing Position",
        `Use the command again, and this time provide me the position of the song you want to remove.\nUsage: \`${prefix}remove <position>\``
      );
      return message.channel.send(response);
    }

    const queueArray = Array.isArray(player.queue) 
      ? player.queue 
      : (player.queue ? Array.from(player.queue) : []);
    const queueLength = queueArray.filter(track => track !== player.queue.current).length;

    const position = parseInt(args[0]);
    if (isNaN(position) || position > queueLength || position <= 0) {
      const response = CommandResponse.createErrorResponse(
        "Invalid Position",
        `Invalid song position. Please provide a number between 1 and ${queueLength}.`
      );
      return message.channel.send(response);
    }

    const removedTrack = player.queue.remove(position - 1);
    const trackTitle = removedTrack?.title || `Song at position ${position}`;

    const response = CommandResponse.createSuccessResponse(
      "Song Removed",
      `Removed song **${position}** from the queue.\n**Track:** ${trackTitle}`
    );

    return message.channel.send(response);
  },
};
