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

class QueueUI {
    /**
     * Creates a queue interface with pagination
     * @param {Object} client - The Discord client
     * @param {Object} currentTrack - Currently playing track
     * @param {Array} queue - Queue array
     * @param {number} page - Current page (0-indexed)
     * @param {number} itemsPerPage - Items per page
     * @returns {Object} Message payload with components and flags
     */
    static createQueueInterface(client, currentTrack, queue, page = 0, itemsPerPage = 10) {
        const accentColor = this.getAccentColor(client);
        const totalPages = Math.ceil(queue.length / itemsPerPage) || 1;
        const start = page * itemsPerPage;
        const end = start + itemsPerPage;
        const queuePage = queue.slice(start, end);

        const container = new ContainerBuilder()
            .setAccentColor(accentColor)
            
            // Header
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# Music Queue`),
                        new TextDisplayBuilder().setContent(
                            `**Total Tracks:** \`${queue.length}\`\n` +
                            `**Page:** \`${page + 1}/${totalPages}\``
                        )
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

        // Add currently playing track
        if (currentTrack) {
            container.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent('**🎵 Now Playing**'),
                        new TextDisplayBuilder().setContent(
                            `[${currentTrack.title}](${currentTrack.uri})\n` +
                            `**Artist:** ${currentTrack.author || 'Unknown'}\n` +
                            `**Duration:** ${this.formatDuration(currentTrack.length || 0)}`
                        )
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            );
        }

        // Add queue items
        if (queuePage.length > 0) {
            const queueText = queuePage
                .map((track, index) => {
                    const position = start + index + 1;
                    return `\`${position}\` • [${track.title}](${track.uri})\n   ${track.author || 'Unknown'} • ${this.formatDuration(track.length || 0)}`;
                })
                .join('\n\n');

            container.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent('**📋 Queue**'),
                        new TextDisplayBuilder().setContent(queueText)
                    )
            );
        } else {
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('**No tracks in queue**')
            );
        }

        // Add pagination buttons if needed
        if (totalPages > 1) {
            container.addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
                    .setDivider(true)
            );

            const prevButton = new ButtonBuilder()
                .setCustomId('queue_prev')
                .setLabel('Previous')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('◀️')
                .setDisabled(page === 0);

            const nextButton = new ButtonBuilder()
                .setCustomId('queue_next')
                .setLabel('Next')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('▶️')
                .setDisabled(page >= totalPages - 1);

            container.addActionRowComponents(
                new ActionRowBuilder().addComponents(prevButton, nextButton)
            );
        }

        return {
            components: [container],
            flags: MessageFlags.IsComponentsV2
        };
    }

    /**
     * Formats duration in milliseconds to readable format
     */
    static formatDuration(ms) {
        if (!ms || isNaN(ms)) return '0:00';
        
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        const secs = seconds % 60;
        const mins = minutes % 60;
        
        if (hours > 0) {
            return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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

module.exports = QueueUI;

