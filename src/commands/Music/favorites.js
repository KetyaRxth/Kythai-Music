const CommandResponse = require("../../components/ui/CommandResponse");
const { 
    ContainerBuilder, 
    TextDisplayBuilder, 
    SectionBuilder, 
    SeparatorBuilder, 
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
  name: "favorites",
  aliases: ["fav", "favs", "saved"],
  description: "Manage your favorite songs",
  category: "Music",
  premium: false,

  run: async (client, message, args, prefix) => {
    try {
      // This is a placeholder - you would implement actual favorites storage
      // For now, we'll show a UI for managing favorites
      
      const subcommand = args[0]?.toLowerCase() || 'list';
      
      switch (subcommand) {
        case 'add':
        case 'save':
          if (!args[1]) {
            const response = CommandResponse.createErrorResponse(
              "Missing Track",
              "Please provide a track name or URL to add to favorites.\nUsage: `" + prefix + "favorites add <track>`"
            );
            return message.channel.send(response);
          }
          
          // In a real implementation, you would save this to a database
          const response = CommandResponse.createSuccessResponse(
            "Favorite Added",
            `Added to favorites: ${args.slice(1).join(' ')}\n\n*Note: Favorites feature requires database setup.*`
          );
          return message.channel.send(response);

        case 'remove':
        case 'delete':
          if (!args[1]) {
            const response = CommandResponse.createErrorResponse(
              "Missing Index",
              "Please provide the index of the favorite to remove.\nUsage: `" + prefix + "favorites remove <index>`"
            );
            return message.channel.send(response);
          }
          
          const removeResponse = CommandResponse.createSuccessResponse(
            "Favorite Removed",
            `Removed favorite at index ${args[1]}\n\n*Note: Favorites feature requires database setup.*`
          );
          return message.channel.send(removeResponse);

        case 'list':
        default:
          // Show favorites list UI
          const accentColor = client.color ? (typeof client.color === 'string' ? parseInt(client.color.replace('#', ''), 16) : client.color) : 0x2b2d31;
          
          const container = new ContainerBuilder()
            .setAccentColor(accentColor)
            .addSectionComponents(
              new SectionBuilder()
                .addTextDisplayComponents(
                  new TextDisplayBuilder().setContent('# ⭐ Your Favorites'),
                  new TextDisplayBuilder().setContent('Manage your saved favorite songs')
                )
            )
            .addSeparatorComponents(
              new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Large)
                .setDivider(true)
            )
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent('**No favorites yet!**\n\nUse `' + prefix + 'favorites add <song>` to save your favorite songs.')
            )
            .addSeparatorComponents(
              new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Large)
                .setDivider(true)
            );

          const addButton = new ButtonBuilder()
            .setCustomId('fav_add')
            .setLabel('Add Favorite')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('➕');

          const refreshButton = new ButtonBuilder()
            .setCustomId('fav_refresh')
            .setLabel('Refresh')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🔄');

          container.addActionRowComponents(
            new ActionRowBuilder().addComponents(addButton, refreshButton)
          );

          return message.channel.send({
            components: [container],
            flags: MessageFlags.IsComponentsV2
          });
      }
    } catch (error) {
      console.error(error);
      const response = CommandResponse.createErrorResponse(
        "Error",
        "An error occurred while managing favorites."
      );
      return message.channel.send(response);
    }
  },
};

