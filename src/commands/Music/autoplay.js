const CommandResponse = require("../../components/ui/CommandResponse");

module.exports = {
  name: "autoplay",
  aliases: ["ap"],
  description: `Play random songs.`,
  category: "Music",
  cooldown: 5,
  inVc: true,
  sameVc: true,
  voteOnly: false,
  premium: false,
  dj: true,
  
  run: async (client, message, args, prefix, player) => {
    try {
      if (!player) {
        const response = CommandResponse.createErrorResponse(
          "No Player Found",
          "No Player Found For This Guild!\nIf you want to enable autoplay, play something you like first."
        );
        return message.channel.send(response);
      }

      if (player.data.get("autoplay")) {
        await player.data.set("autoplay", false);

        const response = CommandResponse.createSuccessResponse(
          "Autoplay Deactivated",
          "Autoplay has been: **Deactivated**"
        );
        return message.reply(response);
      } else {
        if (!player.queue.current) {
          const response = CommandResponse.createErrorResponse(
            "No Track Playing",
            "No track is currently playing.\nPlay a song first to enable autoplay."
          );
          return message.reply(response);
        }

        const identifier = player.queue.current.identifier;

        // Autoplay search logic
        const platforms = [
          `https://open.spotify.com/track/${identifier}`,
          `https://www.deezer.com/track/${identifier}`,
          `https://soundcloud.com/track/${identifier}`,
          `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`
        ];

        let found = false;
        let res = null;

        for (let i = 0; i < platforms.length; i++) {
          res = await client.manager.search(platforms[i], { requester: message.author });

          if (res && res.tracks.length) {
            // Avoid same track
            const filteredTracks = res.tracks.filter(t => t.identifier !== identifier);
            if (filteredTracks.length) {
              res.tracks = filteredTracks;
              found = true;
              break;
            }
          }
        }

        if (!found || !res.tracks.length) {
          const response = CommandResponse.createErrorResponse(
            "No Related Tracks",
            "No valid related tracks found for autoplay."
          );
          return message.reply(response);
        }

        await player.data.set("autoplay", true);
        await player.data.set("requester", message.author);
        await player.data.set("identifier", identifier);
        await player.queue.add(res.tracks[0]);

        const response = CommandResponse.createSuccessResponse(
          "Autoplay Activated",
          "Autoplay has been: **Activated**\nThe bot will now automatically play related songs when the queue ends."
        );

        return message.reply(response);
      }
    } catch (err) {
      console.log(err);
      const response = CommandResponse.createErrorResponse(
        "Error",
        "An error occurred while toggling autoplay.\nIf you want to enable autoplay, play something you like first."
      );
      return message.channel.send(response);
    }
  }
}