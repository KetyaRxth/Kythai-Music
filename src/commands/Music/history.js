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
    MessageFlags
} = require('discord.js');

// SeparatorSpacingSize enum values
const SeparatorSpacingSize = {
    Small: 1,
    Large: 2
};

module.exports = {
  name: "history",
  aliases: ["recent", "played"],
  description: "View recently played songs",
  category: "Music",
  premium: false,

  run: async (client, message, args, prefix) => {
    try {
      const player = client.manager.players.get(message.guild.id);
      
      // In a real implementation, you would store play history in a database
      // For now, we'll show a UI with placeholder data
      
      const accentColor = client.color ? (typeof client.color === 'string' ? parseInt(client.color.replace('#', ''), 16) : client.color) : 0x2b2d31;
      
      const container = new ContainerBuilder()
        .setAccentColor(accentColor)
        .addSectionComponents(
          new SectionBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent('# 📜 Play History'),
              new TextDisplayBuilder().setContent('Recently played songs in this server')
            )
            .setThumbnailAccessory(
              new ThumbnailBuilder()
                .setURL(message.guild.iconURL({ size: 256 }) || client.user.displayAvatarURL({ size: 256 }))
                .setDescription('Server icon')
            )
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Large)
            .setDivider(true)
        );

      // Show current track if playing
      if (player && player.queue.current) {
        const current = player.queue.current;
        container.addSectionComponents(
          new SectionBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent('**🎵 Currently Playing**'),
              new TextDisplayBuilder().setContent(
                `[${current.title}](${current.uri})\n` +
                `**Artist:** ${current.author || 'Unknown'}\n` +
                `**Requested by:** ${current.requester?.username || 'Unknown'}`
              )
            )
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
        );
      }

      // Placeholder for history
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          '**Recent Tracks:**\n\n' +
          '*Play history feature requires database setup.*\n' +
          '*This would show the last 10-20 songs played in this server.*'
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Large)
          .setDivider(true)
      );

      const clearButton = new ButtonBuilder()
        .setCustomId('history_clear')
        .setLabel('Clear History')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🗑️');

      const refreshButton = new ButtonBuilder()
        .setCustomId('history_refresh')
        .setLabel('Refresh')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔄');

      container.addActionRowComponents(
        new ActionRowBuilder().addComponents(clearButton, refreshButton)
      );

      return message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (error) {
      console.error(error);
      const response = CommandResponse.createErrorResponse(
        "Error",
        "An error occurred while fetching play history."
      );
      return message.channel.send(response);
    }
  },
};

