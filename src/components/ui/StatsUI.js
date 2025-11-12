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

class StatsUI {
    /**
     * Creates a comprehensive stats interface
     * @param {Object} client - The Discord client
     * @param {Object} stats - Stats data
     * @returns {Object} Message payload with components and flags
     */
    static createStatsInterface(client, stats) {
        const accentColor = this.getAccentColor(client);
        
        const container = new ContainerBuilder()
            .setAccentColor(accentColor)
            
            // Header with bot avatar
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# ${client.user.username} Statistics`),
                        new TextDisplayBuilder().setContent('Comprehensive bot and system information')
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
            
            // Bot Info Section
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent('**Bot Information**'),
                        new TextDisplayBuilder().setContent(
                            `**Servers:** \`${stats.servers.toLocaleString()}\`\n` +
                            `**Users:** \`${stats.users.toLocaleString()}\`\n` +
                            `**Channels:** \`${stats.channels.toLocaleString()}\`\n` +
                            `**Uptime:** \`${stats.uptime}\``
                        )
                    )
            )
            
            // System Info Section
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent('**System Information**'),
                        new TextDisplayBuilder().setContent(
                            `**Memory Usage:** \`${stats.memory} MB\`\n` +
                            `**CPU Load:** \`${stats.cpu}%\`\n` +
                            `**Node.js:** \`${stats.nodeVersion}\`\n` +
                            `**Discord.js:** \`${stats.djsVersion}\``
                        )
                    )
            )
            
            // Shard Info Section
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent('**Shard Information**'),
                        new TextDisplayBuilder().setContent(
                            `**Shard ID:** \`${stats.shardId}\`\n` +
                            `**Total Shards:** \`${stats.totalShards}\`\n` +
                            `**Ping:** \`${stats.ping}ms\``
                        )
                    )
            );

        // Add developer info if provided
        if (stats.developer) {
            container.addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**Developer:** ${stats.developer}`)
            );
        }

        // Add separator before buttons
        container.addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Large)
                .setDivider(true)
        );

        // Create action buttons
        const inviteButton = new ButtonBuilder()
            .setLabel('Invite Bot')
            .setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}`)
            .setStyle(ButtonStyle.Link);

        const supportButton = new ButtonBuilder()
            .setLabel('Support Server')
            .setURL('https://discord.gg/RPuK3n8YBT')
            .setStyle(ButtonStyle.Link);

        const websiteButton = new ButtonBuilder()
            .setLabel('Website')
            .setURL('https://TitanXMusico.vercel.app')
            .setStyle(ButtonStyle.Link);

        // Add buttons inside container
        container.addActionRowComponents(
            new ActionRowBuilder().addComponents(
                inviteButton, supportButton, websiteButton
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

module.exports = StatsUI;

