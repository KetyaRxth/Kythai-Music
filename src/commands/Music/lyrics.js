const CommandResponse = require("../../components/ui/CommandResponse");
const { 
    ContainerBuilder, 
    TextDisplayBuilder, 
    SectionBuilder, 
    SeparatorBuilder, 
    ThumbnailBuilder,
    MessageFlags
} = require('discord.js');

// SeparatorSpacingSize enum values
const SeparatorSpacingSize = {
    Small: 1,
    Large: 2
};

module.exports = {
  name: "lyrics",
  aliases: ["ly", "lyric"],
  description: "Get lyrics for the current song or search for lyrics",
  category: "Music",
  premium: false,

  run: async (client, message, args, prefix) => {
    try {
      const player = client.manager.players.get(message.guild.id);
      let query = args.join(" ");

      // If no query provided, try to get from current track
      if (!query && player && player.queue.current) {
        query = player.queue.current.title;
      }

      if (!query) {
        const response = CommandResponse.createErrorResponse(
          "Missing Query",
          "Please provide a song name or use this command while music is playing.\nUsage: `" + prefix + "lyrics <song name>`"
        );
        return message.channel.send(response);
      }

      // Try to get lyrics using the lyrics finder (if available)
      let lyrics = null;
      try {
        const lyricsFinder = require('@flytri/lyrics-finder');
        lyrics = await lyricsFinder(query) || null;
      } catch (err) {
        // Lyrics not found or API error
        lyrics = null;
      }

      const accentColor = client.color ? (typeof client.color === 'string' ? parseInt(client.color.replace('#', ''), 16) : client.color) : 0x2b2d31;
      
      const container = new ContainerBuilder()
        .setAccentColor(accentColor)
        .addSectionComponents(
          new SectionBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`# 🎵 Lyrics: ${query}`),
              new TextDisplayBuilder().setContent(
                player && player.queue.current && query === player.queue.current.title
                  ? `**Artist:** ${player.queue.current.author || 'Unknown'}`
                  : 'Searching for lyrics...'
              )
            )
            .setThumbnailAccessory(
              new ThumbnailBuilder()
                .setURL(
                  (player && player.queue.current && player.queue.current.thumbnail) 
                    ? player.queue.current.thumbnail 
                    : client.user.displayAvatarURL({ size: 256 })
                )
                .setDescription('Track thumbnail')
            )
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Large)
            .setDivider(true)
        );

      if (lyrics) {
        // Split lyrics into chunks if too long (max 4000 chars per text display)
        const lyricsChunks = [];
        const maxLength = 3500;
        
        if (lyrics.length > maxLength) {
          for (let i = 0; i < lyrics.length; i += maxLength) {
            lyricsChunks.push(lyrics.slice(i, i + maxLength));
          }
        } else {
          lyricsChunks.push(lyrics);
        }

        lyricsChunks.forEach((chunk, index) => {
          if (index > 0) {
            container.addSeparatorComponents(
              new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
            );
          }
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(chunk)
          );
        });
      } else {
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            '❌ **Lyrics not found**\n\n' +
            'Could not find lyrics for this song. Try:\n' +
            '• Searching with the full song name and artist\n' +
            '• Using a different song name\n' +
            '• Checking if the song has available lyrics online'
          )
        );
      }

      return message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (error) {
      console.error(error);
      const response = CommandResponse.createErrorResponse(
        "Error",
        "An error occurred while fetching lyrics."
      );
      return message.channel.send(response);
    }
  },
};
