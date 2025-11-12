const NowPlayingUI = require("../../components/ui/NowPlayingUI");
const CommandResponse = require("../../components/ui/CommandResponse");

module.exports = {
  name: "nowplaying",
  aliases: ["np", "now"],
  description: "Show the current song and next 3 in queue",
  category: "Music",
  owner: false,
  inVc: true,
  sameVc: false,
  premium: false,
  dj: true,

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

      const current = player.queue.current;
      if (!current) {
        const response = CommandResponse.createErrorResponse(
          "Nothing Playing",
          "No track is currently playing."
        );
        return message.channel.send(response);
      }

      // Get upcoming tracks (next 3)
      const queueArray = Array.isArray(player.queue)
        ? player.queue.filter(track => track !== current)
        : Array.from(player.queue).filter(track => track !== current);
      const upcoming = queueArray.slice(0, 3);

      // Get player state
      const playerState = {
        paused: player.paused,
        position: player.position || 0,
        volume: player.volume || 100
      };

      // Format track data
      const currentTrack = {
        title: current.title,
        author: current.author,
        uri: current.uri,
        thumbnail: current.thumbnail,
        length: current.length,
        requester: current.requester
      };

      const upcomingTracks = upcoming.map(track => ({
        title: track.title,
        author: track.author,
        uri: track.uri,
        length: track.length
      }));

      const response = NowPlayingUI.createNowPlayingInterface(
        client,
        currentTrack,
        upcomingTracks,
        playerState
      );

      const msg = await message.channel.send(response);

      // Set up button collectors
      const collector = msg.createMessageComponentCollector({
        filter: i => i.user.id === message.author.id,
        time: 300000 // 5 minutes
      });

      collector.on('collect', async (interaction) => {
        if (!interaction.isButton()) return;
        await interaction.deferUpdate();

        switch (interaction.customId) {
          case 'np_pause_resume':
            if (player.paused) {
              player.resume();
            } else {
              player.pause();
            }
            // Refresh the interface
            const updatedState = {
              paused: player.paused,
              position: player.position || 0,
              volume: player.volume || 100
            };
            const updatedResponse = NowPlayingUI.createNowPlayingInterface(
              client,
              currentTrack,
              upcomingTracks,
              updatedState
            );
            await msg.edit(updatedResponse);
            break;

          case 'np_skip':
            player.skip();
            await interaction.followUp({
              content: '⏭️ Skipped to next track',
              ephemeral: true
            });
            break;

          case 'np_queue':
            // This would trigger a queue view - you can implement this
            await interaction.followUp({
              content: 'Use `' + prefix + 'queue` to view the full queue',
              ephemeral: true
            });
            break;
        }
      });

      collector.on('end', () => {
        // Disable buttons when collector ends
        msg.edit({ components: [] }).catch(() => {});
      });

    } catch (error) {
      console.log(error);
      const response = CommandResponse.createErrorResponse(
        "Error",
        "An unexpected error occurred while showing the current track."
      );
      return message.channel.send(response);
    }
  },
};
