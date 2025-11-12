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

class HelpUI {
    /**
     * @param {Object} client 
     * @param {Object} formattedCategories 
     * @param {string} prefix 
     * @param {Object} emoji
     * @returns {Object} 
     */
    static createMainHelpInterface(client, formattedCategories, prefix, emoji = {}) {
        const totalCommands = Object.values(formattedCategories).flat().length;
        
        // Get accent color
        const accentColor = this.getAccentColor(client);
        
        const defaultEmoji = {
            music: "<:titan_musicnote:1425847922301472900>",
            filters: "<:titan_filters:1425848031659425883>",
            purge: "<:titan_flash:1425847818592981095>",
            config: "<:titan_ferramenta:1425847690734080093>",
            info: "<:titan_info:1425847569992515605>",
            owner: "👑",
            premium: "💎"
        };
        const emojiMap = Object.keys(emoji).length > 0 ? emoji : defaultEmoji;

        const container = new ContainerBuilder()
            .setAccentColor(accentColor)
            
            // Header section with bot avatar
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# 👋 Hey, I'm <@${client.user.id}>!`),
                        new TextDisplayBuilder().setContent(`**${client.user.username} Help Menu**\nYour ultimate music companion for Discord`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(client.user.displayAvatarURL({ size: 256 }))
                            .setDescription(`${client.user.username}'s avatar`)
                    )
            )
            
            // Separator
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
                    .setDivider(true)
            )
            
            // Bot statistics
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `**Prefix:** \`${prefix}\`\n` +
                    `**Total Commands:** \`${totalCommands}\``
                )
            )
            
            // Separator
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
                    .setDivider(true)
            )
            
            // Categories header
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('## Available Categories')
            );

        // Add category sections
        const categoryEntries = Object.entries(formattedCategories)
            .filter(([_, commands]) => commands.length > 0);
        
        // Build category list text
        const categoryList = categoryEntries
            .map(([category, commands]) => {
                const emojiKey = category.toLowerCase();
                const categoryEmoji = emojiMap[emojiKey] || '•';
                return `${categoryEmoji} **${category}**`;
            })
            .join('\n');
        
        // Add categories as text display (not section since no accessory needed)
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(categoryList)
        );

        // Footer instruction
        container.addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`*Select a category from the menu below to view commands!*`)
        );

        // Add separator before interactive components
        container.addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Large)
                .setDivider(true)
        );

        // Create select menu for categories
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('help-category-select')
            .setPlaceholder('Select a category to view commands')
            .addOptions(
                Object.entries(formattedCategories)
                    .filter(([_, commands]) => commands.length > 0)
                    .map(([category, commands]) => {
                        const emojiKey = category.toLowerCase();
                        return new StringSelectMenuOptionBuilder()
                            .setLabel(category)
                            .setDescription(`${commands.length} commands available`)
                            .setValue(category)
                            .setEmoji(emojiMap[emojiKey] || '•');
                    })
            );

        // Add "Main Menu" option
        selectMenu.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(' Main Menu')
                .setDescription('Return to the main help menu')
                .setValue('main')
        );

        // Add select menu inside container
        container.addActionRowComponents(
            new ActionRowBuilder().addComponents(selectMenu)
        );

        // Create buttons
        const supportButton = new ButtonBuilder()
            .setLabel('Support')
            .setURL('https://discord.gg/RPuK3n8YBT')
            .setStyle(ButtonStyle.Link);

        const premiumButton = new ButtonBuilder()
            .setLabel('Premium')
            .setURL('https://discord.gg/RPuK3n8YBT')
            .setStyle(ButtonStyle.Link);

        const inviteButton = new ButtonBuilder()
            .setLabel('Invite Me')
            .setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}`)
            .setStyle(ButtonStyle.Link);

        // Add buttons inside container
        container.addActionRowComponents(
            new ActionRowBuilder().addComponents(
                inviteButton, supportButton, premiumButton
            )
        );

        return {
            components: [container],
            flags: MessageFlags.IsComponentsV2
        };
    }

    /**
     * Creates a category-specific help interface
     * @param {Object} client - The Discord client
     * @param {string} categoryName - Name of the category
     * @param {Array} commands - Array of command objects
     * @param {string} prefix - Bot prefix
     * @param {Object} formattedCategories - All categories (for select menu)
     * @param {Object} emoji - Emoji mappings for categories
     * @returns {Object} Message payload with components and flags
     */
    static createCategoryHelpInterface(client, categoryName, commands, prefix, formattedCategories = {}, emoji = {}) {
        if (!commands || commands.length === 0) {
            return this.createEmptyCategoryInterface(client, categoryName);
        }

        const accentColor = this.getAccentColor(client);
        
        // Use provided emoji or default
        const defaultEmoji = {
            music: "<:titan_musicnote:1425847922301472900>",
            filters: "<:titan_filters:1425848031659425883>",
            purge: "<:titan_flash:1425847818592981095>",
            config: "<:titan_ferramenta:1425847690734080093>",
            info: "<:titan_info:1425847569992515605>",
            owner: "👑",
            premium: "💎"
        };
        const emojiMap = Object.keys(emoji).length > 0 ? emoji : defaultEmoji;

        const emojiKey = categoryName.toLowerCase();
        const categoryEmoji = emojiMap[emojiKey] || '•';

        const container = new ContainerBuilder()
            .setAccentColor(accentColor)
            
            // Category header with bot avatar
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`## ${categoryEmoji} ${categoryName} Commands`),
                        new TextDisplayBuilder().setContent(`**Total Commands:** \`${commands.length}\``)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(client.user.displayAvatarURL({ size: 256 }))
                            .setDescription(`${client.user.username}'s avatar`)
                    )
            )
            
            // Separator
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
                    .setDivider(true)
            );

        // Format commands in compact format: ?help, ?join, ?play, etc.
        const commandList = commands
            .map(cmd => `\`${prefix}${cmd.name}\``)
            .join(', ');

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(commandList)
        );

        // Footer instruction
        container.addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`*Use the menu below to navigate or return to main menu*`)
        );

        // Add separator before interactive components
        container.addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Large)
                .setDivider(true)
        );

        // Create select menu for categories (same as main interface)
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('help-category-select')
            .setPlaceholder('📋 Select a category to view commands')
            .addOptions(
                Object.entries(formattedCategories || {})
                    .filter(([_, commands]) => commands && commands.length > 0)
                    .map(([category, commands]) => {
                        const emojiKey = category.toLowerCase();
                        const categoryEmoji = emojiMap[emojiKey] || '•';
                        return new StringSelectMenuOptionBuilder()
                            .setLabel(category)
                            .setDescription(`${commands.length} commands available`)
                            .setValue(category)
                            .setEmoji(categoryEmoji);
                    })
            );

        // Add "Main Menu" option
        selectMenu.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('🏠 Main Menu')
                .setDescription('Return to the main help menu')
                .setValue('main')
        );

        // Add select menu inside container
        container.addActionRowComponents(
            new ActionRowBuilder().addComponents(selectMenu)
        );

        // Create buttons
        const supportButton = new ButtonBuilder()
            .setLabel('Support')
            .setURL('https://discord.gg/RPuK3n8YBT')
            .setStyle(ButtonStyle.Link);

        const premiumButton = new ButtonBuilder()
            .setLabel('Premium')
            .setURL('https://discord.gg/RPuK3n8YBT')
            .setStyle(ButtonStyle.Link);

        const inviteButton = new ButtonBuilder()
            .setLabel('Invite Me')
            .setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}`)
            .setStyle(ButtonStyle.Link);

        // Add buttons inside container
        container.addActionRowComponents(
            new ActionRowBuilder().addComponents(
                inviteButton, supportButton, premiumButton
            )
        );

        return {
            components: [container],
            flags: MessageFlags.IsComponentsV2
        };
    }

    /**
     * Creates an empty category interface
     */
    static createEmptyCategoryInterface(client, categoryName) {
        const accentColor = this.getAccentColor(client);
        
        const container = new ContainerBuilder()
            .setAccentColor(accentColor)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`## ${categoryName} Commands`),
                new TextDisplayBuilder().setContent('❌ **No commands found in this category.**')
            );

        return {
            components: [container],
            flags: MessageFlags.IsComponentsV2
        };
    }

    /**
     * Gets the accent color from client
     */
    static getAccentColor(client) {
        const color = client.color || '#2b2d31';
        if (typeof color === 'string') {
            return parseInt(color.replace('#', ''), 16);
        }
        return color;
    }
}

module.exports = HelpUI;
