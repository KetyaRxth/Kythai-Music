const QueueUI = require("../../components/ui/QueueUI");
const CommandResponse = require("../../components/ui/CommandResponse");

module.exports = {
  name: "queue",
  aliases: ["q", "list"],
  description: "Show the current music queue",
  category: "Music",
  owner: false,

  run: async (client, message, args, prefix) => {
    try {
      const player = client.manager.players.get(message.guild.id);
      if (!player) {
        const response = CommandResponse.createErrorResponse(
          "No Player Found",
          "There is no active player in this server."
        );
        return message.channel.send(response);
      }

      const currentTrack = player.queue.current;
      // Get queue array (excluding current track)
      const queueArray = Array.isArray(player.queue) 
        ? player.queue.filter(track => track !== currentTrack)
        : Array.from(player.queue).filter(track => track !== currentTrack);

      if (!currentTrack && queueArray.length === 0) {
        const response = CommandResponse.createErrorResponse(
          "Empty Queue",
          "The queue is currently empty."
        );
        return message.channel.send(response);
      }

      // Get page from args or default to 0
      const page = args[0] ? parseInt(args[0]) - 1 : 0;
      const validPage = Math.max(0, Math.min(page, Math.ceil(queueArray.length / 10) - 1));

      // Format current track
      const formattedCurrent = currentTrack ? {
        title: currentTrack.title,
        author: currentTrack.author,
        uri: currentTrack.uri,
        length: currentTrack.length
      } : null;

      // Format queue tracks
      const formattedQueue = queueArray.map(track => ({
        title: track.title,
        author: track.author,
        uri: track.uri,
        length: track.length
      }));

      const response = QueueUI.createQueueInterface(
        client,
        formattedCurrent,
        formattedQueue,
        validPage,
        10
      );

      const msg = await message.channel.send(response);

      // Set up pagination collector
      const collector = msg.createMessageComponentCollector({
        filter: i => i.user.id === message.author.id,
        time: 60000 // 1 minute
      });

      let currentPage = validPage;

      collector.on('collect', async (interaction) => {
        if (!interaction.isButton()) return;
        await interaction.deferUpdate();

        if (interaction.customId === 'queue_prev') {
          currentPage = Math.max(0, currentPage - 1);
        } else if (interaction.customId === 'queue_next') {
          const totalPages = Math.ceil(formattedQueue.length / 10) || 1;
          currentPage = Math.min(totalPages - 1, currentPage + 1);
        }

        const updatedResponse = QueueUI.createQueueInterface(
          client,
          formattedCurrent,
          formattedQueue,
          currentPage,
          10
        );

        await msg.edit(updatedResponse);
      });

      collector.on('end', () => {
        // Disable buttons when collector ends
        msg.edit({ components: [] }).catch(() => {});
      });

    } catch (error) {
      console.log(error);
      const response = CommandResponse.createErrorResponse(
        "Error",
        "An unexpected error occurred while showing the queue."
      );
      return message.channel.send(response);
    }
  },
};
