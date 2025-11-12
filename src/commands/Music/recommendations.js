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
  name: "recommendations",
  aliases: ["rec", "recommend", "suggest"],
  description: "Get song recommendations based on current track or your preferences",
  category: "Music",
  premium: false,

  run: async (client, message, args, prefix) => {
    try {
      const player = client.manager.players.get(message.guild.id);
      
      if (!player || !player.queue.current) {
        const response = CommandResponse.createErrorResponse(
          "No Track Playing",
          "No track is currently playing.\nPlay a song first to get recommendations based on it."
        );
        return message.channel.send(response);
      }

      const currentTrack = player.queue.current;
      const accentColor = client.color ? (typeof client.color === 'string' ? parseInt(client.color.replace('#', ''), 16) : client.color) : 0x2b2d31;
      
      const container = new ContainerBuilder()
        .setAccentColor(accentColor)
        .addSectionComponents(
          new SectionBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent('# 🎯 Recommendations'),
              new TextDisplayBuilder().setContent(
                `Based on: **${currentTrack.title}**\n` +
                `**Artist:** ${currentTrack.author || 'Unknown'}`
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
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            '**Recommended Songs:**\n\n' +
            '*Recommendations feature would show similar songs based on:\n' +
            '• Current track genre and style\n' +
            '• Similar artists\n' +
            '• Your listening history\n' +
            '• Popular tracks in the same category*'
          )
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Large)
            .setDivider(true)
        );

      // Create select menu for recommendations (placeholder)
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('rec_select')
        .setPlaceholder('📋 Select a recommendation to play')
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('Similar Song 1')
            .setDescription('Based on current track')
            .setValue('rec_1')
            .setEmoji('🎵'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Similar Song 2')
            .setDescription('Based on current track')
            .setValue('rec_2')
            .setEmoji('🎵'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Similar Song 3')
            .setDescription('Based on current track')
            .setValue('rec_3')
            .setEmoji('🎵')
        );

      container.addActionRowComponents(
        new ActionRowBuilder().addComponents(selectMenu)
      );

      const playAllButton = new ButtonBuilder()
        .setCustomId('rec_play_all')
        .setLabel('Play All Recommendations')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('▶️');

      const refreshButton = new ButtonBuilder()
        .setCustomId('rec_refresh')
        .setLabel('Refresh')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔄');

      container.addActionRowComponents(
        new ActionRowBuilder().addComponents(playAllButton, refreshButton)
      );

      return message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (error) {
      console.error(error);
      const response = CommandResponse.createErrorResponse(
        "Error",
        "An error occurred while fetching recommendations."
      );
      return message.channel.send(response);
    }
  },
};

