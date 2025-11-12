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

class ServerInfoUI {
    /**
     * Creates a server information interface
     * @param {Object} client - The Discord client
     * @param {Object} guild - The Discord guild
     * @param {Object} serverData - Server data object
     * @returns {Object} Message payload with components and flags
     */
    static createServerInfoInterface(client, guild, serverData) {
        const accentColor = this.getAccentColor(client);
        
        const container = new ContainerBuilder()
            .setAccentColor(accentColor)
            
            // Header with server icon
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# ${guild.name}`),
                        new TextDisplayBuilder().setContent('Server Information')
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(guild.iconURL({ size: 256 }) || client.user.displayAvatarURL({ size: 256 }))
                            .setDescription(`${guild.name} server icon`)
                    )
            )
            
            // Separator
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
                    .setDivider(true)
            )
            
            // Basic Info
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent('**Basic Information**'),
                        new TextDisplayBuilder().setContent(
                            `**Owner:** ${serverData.owner}\n` +
                            `**Server ID:** \`${guild.id}\`\n` +
                            `**Created:** ${serverData.created}`
                        )
                    )
            )
            
            // Separator
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            
            // Members Info
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent('**Members**'),
                        new TextDisplayBuilder().setContent(
                            `**Total:** \`${serverData.members}\`\n` +
                            `**Humans:** \`${serverData.humans}\`\n` +
                            `**Bots:** \`${serverData.bots}\``
                        )
                    )
            )
            
            // Separator
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            
            // Channels Info
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent('**Channels**'),
                        new TextDisplayBuilder().setContent(
                            `**Total:** \`${serverData.channels}\`\n` +
                            `**Text:** \`${serverData.textChannels}\`\n` +
                            `**Voice:** \`${serverData.voiceChannels}\``
                        )
                    )
            )
            
            // Separator
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            
            // Other Info
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent('**Other Information**'),
                        new TextDisplayBuilder().setContent(
                            `**Roles:** \`${serverData.roles}\`\n` +
                            `**Emojis:** \`${serverData.emojis}\`\n` +
                            `**Boost Level:** \`${serverData.boostLevel}\``
                        )
                    )
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

module.exports = ServerInfoUI;

