const CommandResponse = require("../../components/ui/CommandResponse");
const { 
    ContainerBuilder, 
    TextDisplayBuilder, 
    SectionBuilder, 
    SeparatorBuilder, 
    ThumbnailBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    MessageFlags
} = require('discord.js');

// SeparatorSpacingSize enum values
const SeparatorSpacingSize = {
    Small: 1,
    Large: 2
};

module.exports = {
  name: "similar",
  aliases: ["sim", "related"],
  description: "Find similar songs to the current track",
  category: "Music",
  premium: false,

  run: async (client, message, args, prefix) => {
    try {
      const player = client.manager.players.get(message.guild.id);
      
      if (!player || !player.queue.current) {
        const response = CommandResponse.createErrorResponse(
          "No Track Playing",
          "No track is currently playing.\nPlay a song first to find similar tracks."
        );
        return message.channel.send(response);
      }

      const currentTrack = player.queue.current;
      
      // Search for similar tracks using YouTube's related videos
      try {
        const identifier = currentTrack.identifier;
        const searchQuery = `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`;
        
        const result = await client.manager.search(searchQuery, {
          requester: message.author
        });

        if (result.tracks && result.tracks.length > 0) {
          // Filter out the current track
          const similarTracks = result.tracks
            .filter(track => track.identifier !== identifier)
            .slice(0, 10);

          if (similarTracks.length > 0) {
            const accentColor = client.color ? (typeof client.color === 'string' ? parseInt(client.color.replace('#', ''), 16) : client.color) : 0x2b2d31;
            
            const container = new ContainerBuilder()
              .setAccentColor(accentColor)
              .addSectionComponents(
                new SectionBuilder()
                  .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('# 🎵 Similar Songs'),
                    new TextDisplayBuilder().setContent(
                      `Based on: **${currentTrack.title}**\n` +
                      `Found **${similarTracks.length}** similar tracks`
                    )
                  )
                  .setThumbnailAccessory(
                    new ThumbnailBuilder()
                      .setURL(currentTrack.thumbnail || client.user.displayAvatarURL({ size: 256 }))
                      .setDescription('Current track thumbnail')
                  )
              )
              .addSeparatorComponents(
                new SeparatorBuilder()
                  .setSpacing(SeparatorSpacingSize.Large)
                  .setDivider(true)
              );

            // Add tracks as sections
            similarTracks.slice(0, 5).forEach((track, index) => {
              if (index > 0) {
                container.addSeparatorComponents(
                  new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
                );
              }

              container.addSectionComponents(
                new SectionBuilder()
                  .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`**${index + 1}.** [${track.title}](${track.uri})`),
                    new TextDisplayBuilder().setContent(`**Artist:** ${track.author || 'Unknown'}\n**Duration:** ${this.formatDuration(track.length || 0)}`)
                  )
              );
            });

            if (similarTracks.length > 5) {
              container.addSeparatorComponents(
                new SeparatorBuilder()
                  .setSpacing(SeparatorSpacingSize.Small)
              )
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`*...and ${similarTracks.length - 5} more similar tracks*`)
              );
            }

            container.addSeparatorComponents(
              new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Large)
                .setDivider(true)
            );

            // Create select menu for adding tracks
            const selectMenu = new StringSelectMenuBuilder()
              .setCustomId('similar_add')
              .setPlaceholder('📋 Select tracks to add to queue')
              .setMinValues(1)
              .setMaxValues(Math.min(5, similarTracks.length))
              .addOptions(
                similarTracks.slice(0, 25).map((track, index) => 
                  new StringSelectMenuOptionBuilder()
                    .setLabel(track.title.slice(0, 100))
                    .setDescription(track.author?.slice(0, 50) || 'Unknown')
                    .setValue(index.toString())
                    .setEmoji('🎵')
                )
              );

            container.addActionRowComponents(
              new ActionRowBuilder().addComponents(selectMenu)
            );

            const msg = await message.channel.send({
              components: [container],
              flags: MessageFlags.IsComponentsV2
            });

            // Set up collector
            const collector = msg.createMessageComponentCollector({
              filter: i => i.user.id === message.author.id,
              time: 60000
            });

            collector.on('collect', async (interaction) => {
              if (!interaction.isStringSelectMenu()) return;
              await interaction.deferUpdate();

              const selectedIndices = interaction.values.map(v => parseInt(v));
              const selectedTracks = selectedIndices.map(idx => similarTracks[idx]);

              selectedTracks.forEach(track => {
                player.queue.add(track);
              });

              const response = CommandResponse.createSuccessResponse(
                "Tracks Added",
                `Added **${selectedTracks.length}** similar track(s) to the queue.`
              );

              await msg.edit(response);
            });

            collector.on('end', () => {
              msg.edit({ components: [] }).catch(() => {});
            });

            return;
          }
        }
      } catch (err) {
        console.error('Error searching for similar tracks:', err);
      }

      // Fallback if no similar tracks found
      const response = CommandResponse.createWarningResponse(
        "No Similar Tracks",
        "Could not find similar tracks for the current song.\nTry using `" + prefix + "autoplay` to enable automatic related song playback."
      );
      return message.channel.send(response);

    } catch (error) {
      console.error(error);
      const response = CommandResponse.createErrorResponse(
        "Error",
        "An error occurred while finding similar tracks."
      );
      return message.channel.send(response);
    }
  },

  formatDuration(ms) {
    if (!ms || isNaN(ms)) return '0:00';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
};

