const {
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
} = require("discord.js");
const fs = require('fs');
const path = require('path');

// Import our new UI components
const HelpUI = require("../../components/ui/HelpUI");

module.exports = {
  name: "help",
  aliases: ["h"],
  description: "Displays all available commands",
  category: "Info",
  cooldown: 5,
  run: async (client, message, args, prefix) => {
    // Custom emoji mappings
    const emoji = {
      music: "<:titan_musicnote:1425847922301472900>",
      filters: "<:titan_filters:1425848031659425883>",
      playlist: "<:titan_Playlist:1425848256906264619>",
      purge: "<:titan_flash:1425847818592981095>",
      config: "<:titan_ferramenta:1425847690734080093>",
      info: "<:titan_info:1425847569992515605>",
      owner: "👑",
      premium: "💎"
    };

    // Get all command categories dynamically
    const categories = {};
    const commandsPath = path.join(__dirname, '..');
    const categoryFolders = fs.readdirSync(commandsPath);

    for (const folder of categoryFolders) {
      if (!fs.statSync(path.join(commandsPath, folder)).isDirectory()) continue;

      const commandFiles = fs.readdirSync(path.join(commandsPath, folder))
        .filter(file => file.endsWith('.js'));

      categories[folder] = commandFiles.map(file => {
        const command = require(path.join(commandsPath, folder, file));
        return {
          name: command.name,
          description: command.description || 'No description',
          aliases: command.aliases || []
        };
      });
    }

    // Format category names
    const formattedCategories = {
      'Music': categories['Music'] || [],
      'Filters': categories['Filters'] || [],
      'Purge': categories['Purge'] || [],
      'Config': categories['Config'] || [],
      'Info': categories['Info'] || [],
      'Owner': categories['Owner'] || [],
      'Premium': categories['Premium'] || [],
    };

    // Convert hex color to number if needed
    const getColor = () => {
      const color = client.color || '#2b2d31';
      if (typeof color === 'string') {
        return parseInt(color.replace('#', ''), 16);
      }
      return color;
    };

    // Create the main help interface using our new UI component
    // Buttons and select menu are now inside the container
    const response = HelpUI.createMainHelpInterface(client, formattedCategories, prefix, emoji);

    // Send the message with Components v2 (everything is inside the container)
    const msg = await message.channel.send(response);

    // Component collector
    const collector = msg.createMessageComponentCollector({
      filter: i => i.user.id === message.author.id,
      time: 300000 // 5 minutes
    });

    collector.on('collect', async (interaction) => {
      if (interaction.isStringSelectMenu()) {
        await interaction.deferUpdate();
        
        const selectedValue = interaction.values[0];
        
        if (selectedValue === 'main') {
          // Return to main menu
          const mainResponse = HelpUI.createMainHelpInterface(client, formattedCategories, prefix, emoji);
          await msg.edit(mainResponse);
        } else {
          // Show category commands
          const categoryResponse = HelpUI.createCategoryHelpInterface(
            client,
            selectedValue,
            formattedCategories[selectedValue] || [],
            prefix,
            formattedCategories,
            emoji
          );
          
          await msg.edit(categoryResponse);
        }
      }
    });

    collector.on('end', () => {
      // Create a simple expired container
      const expiredContainer = new ContainerBuilder()
        .setAccentColor(getColor())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('⏱️ **This help menu has expired.**\n*Run the help command again to create a new one.*')
        );
      
      msg.edit({ 
        components: [expiredContainer],
        flags: MessageFlags.IsComponentsV2
      }).catch(() => {});
    });
  },
};