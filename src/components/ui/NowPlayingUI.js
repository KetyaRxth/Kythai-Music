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

class NowPlayingUI {
    /**
     * Creates a now playing interface
     * @param {Object} client - The Discord client
     * @param {Object} currentTrack - Currently playing track
     * @param {Array} upcoming - Upcoming tracks (max 3)
     * @param {Object} playerState - Player state (position, duration, etc.)
     * @returns {Object} Message payload with components and flags
     */
    static createNowPlayingInterface(client, currentTrack, upcoming = [], playerState = {}) {
        const accentColor = this.getAccentColor(client);

        const container = new ContainerBuilder()
            .setAccentColor(accentColor)
            
            // Header
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('## 🎵 Now Playing')
            )
            
            // Current track section with thumbnail
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# ${currentTrack.title}`),
                        new TextDisplayBuilder().setContent(
                            `**Artist:** ${currentTrack.author || 'Unknown'}\n` +
                            `**Duration:** ${this.formatDuration(currentTrack.length || 0)}\n` +
                            `**Requested by:** ${currentTrack.requester?.username || 'Unknown'}`
                        ),
                        new TextDisplayBuilder().setContent(
                            `⏱️ ${this.formatPosition(playerState.position || 0)} / ${this.formatDuration(currentTrack.length || 0)}`
                        )
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(currentTrack.thumbnail || client.user.displayAvatarURL({ size: 256 }))
                            .setDescription('Track thumbnail')
                    )
            );

        // Add progress bar
        if (currentTrack.length) {
            container.addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    this.createProgressBar(playerState.position || 0, currentTrack.length)
                )
            );
        }

        // Add upcoming tracks
        if (upcoming.length > 0) {
            container.addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
                    .setDivider(true)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('**📌 Up Next**')
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            );

            const upcomingText = upcoming
                .map((track, i) => 
                    `\`${i + 1}\` • [${track.title}](${track.uri})\n   ${track.author || 'Unknown'} • ${this.formatDuration(track.length || 0)}`
                )
                .join('\n\n');

            container.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(upcomingText)
                    )
            );
        } else {
            container.addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
                    .setDivider(true)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('*No songs in the queue*')
            );
        }

        // Add control buttons
        container.addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Large)
                .setDivider(true)
        );

        const pauseResumeButton = new ButtonBuilder()
            .setCustomId('np_pause_resume')
            .setLabel(playerState.paused ? 'Resume' : 'Pause')
            .setStyle(playerState.paused ? ButtonStyle.Success : ButtonStyle.Secondary)
            .setEmoji(playerState.paused ? '▶️' : '⏸️');

        const skipButton = new ButtonBuilder()
            .setCustomId('np_skip')
            .setLabel('Skip')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('⏭️');

        const queueButton = new ButtonBuilder()
            .setCustomId('np_queue')
            .setLabel('View Queue')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('📋');

        container.addActionRowComponents(
            new ActionRowBuilder().addComponents(
                pauseResumeButton, skipButton, queueButton
            )
        );

        return {
            components: [container],
            flags: MessageFlags.IsComponentsV2
        };
    }

    /**
     * Creates a progress bar
     */
    static createProgressBar(current, total, length = 20) {
        if (!total || total === 0) {
            return `\`${'░'.repeat(length)}\` 0%`;
        }

        const progress = Math.min(Math.floor((current / total) * length), length);
        const bar = '█'.repeat(progress) + '░'.repeat(length - progress);
        const percentage = Math.floor((current / total) * 100);
        
        return `\`${bar}\` ${percentage}%`;
    }

    /**
     * Formats position in milliseconds
     */
    static formatPosition(ms) {
        return this.formatDuration(ms);
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

module.exports = NowPlayingUI;

