const { 
    ContainerBuilder, 
    TextDisplayBuilder, 
    SectionBuilder, 
    SeparatorBuilder, 
    SeparatorSpacingSize,
    ButtonBuilder, 
    ButtonStyle,
    ThumbnailBuilder,
    ActionRowBuilder,
    MessageFlags
} = require('discord.js');

const ContainerFactory = require('../utils/ContainerFactory');
const ButtonFactory = require('../utils/ButtonFactory');
const CanvasPlayer = require('../utils/CanvasPlayer');

/**
 * Creates a section without an accessory, working around SectionBuilder's undefined accessory validation issue
 * @param {...TextDisplayBuilder} textDisplays - Text display components to add
 * @returns {SectionBuilder} - A section that can be safely serialized
 */
function createSectionWithoutAccessory(...textDisplays) {
    const section = new SectionBuilder();
    section.addTextDisplayComponents(...textDisplays);
    
    // Override toJSON to handle undefined accessory by directly constructing JSON
    // SectionBuilder's toJSON always validates accessory even if undefined, causing errors
    section.toJSON = function() {
        // Directly construct the JSON without validating the accessory
        // This is safe because we know this section intentionally has no accessory
        return {
            type: 10, // Section component type (from discord-api-types)
            components: this.components.map(c => c.toJSON())
            // Intentionally omit accessory property - sections can exist without accessories
        };
    };
    
    return section;
}

class MusicPlayer {
    static async createPlayerInterface(currentTrack, queue, playerState, client = null) {
        // Create canvas-based player image
        const playerImage = await CanvasPlayer.createPlayerImage(currentTrack, playerState, queue, client);
        
        const accentColor = client?.color ? (typeof client.color === 'string' ? parseInt(client.color.replace('#', ''), 16) : client.color) : 0x2b2d31;
        let container = new ContainerBuilder().setAccentColor(accentColor);
        
        // Add canvas player image if available
        if (playerImage) {
            const section = createSectionWithoutAccessory(
                new TextDisplayBuilder().setContent(`**${currentTrack?.title || 'Unknown Track'}**`)
            );
            container.addSectionComponents(section);
        } else {
            // Fallback to text-based display if canvas fails
            if (currentTrack) {
                let section = new SectionBuilder();
                
                section.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`**${currentTrack.title}**`),
                    new TextDisplayBuilder().setContent(`${playerState?.position || '0:00'} / ${currentTrack.duration || 'Unknown'}`)
                );
                
                if (currentTrack.thumbnail && ThumbnailBuilder && typeof ThumbnailBuilder === 'function') {
                    try {
                        // Validate URL is not empty or invalid
                        const thumbnailUrl = currentTrack.thumbnail;
                        if (thumbnailUrl && typeof thumbnailUrl === 'string' && thumbnailUrl.trim().length > 0) {
                            const thumbnail = new ThumbnailBuilder()
                                .setURL(thumbnailUrl)
                                .setDescription('Track thumbnail');
                            
                            // Double-check thumbnail is valid before setting
                            if (thumbnail && thumbnail instanceof ThumbnailBuilder) {
                                // Test that the thumbnail can be serialized
                                try {
                                    thumbnail.toJSON();
                                    section.setThumbnailAccessory(thumbnail);
                                    // Verify the accessory was set correctly (not undefined)
                                    if (section.accessory === undefined) {
                                        console.warn('Thumbnail accessory was set to undefined, removing it');
                                        // Remove the undefined accessory by creating a new section
                                        const newSection = new SectionBuilder();
                                        newSection.addTextDisplayComponents(
                                            new TextDisplayBuilder().setContent(`**${currentTrack.title}**`),
                                            new TextDisplayBuilder().setContent(`${playerState?.position || '0:00'} / ${currentTrack.duration || 'Unknown'}`)
                                        );
                                        section = newSection;
                                    }
                                } catch (thumbError) {
                                    console.error('Thumbnail serialization failed, skipping accessory:', thumbError);
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Error creating thumbnail accessory:', error);
                    }
                }
                
                // Check if section has an undefined accessory and fix it
                if (section.accessory === undefined && 'accessory' in section) {
                    // Section has undefined accessory - use helper to create safe version
                    const safeSection = createSectionWithoutAccessory(
                        new TextDisplayBuilder().setContent(`**${currentTrack.title}**`),
                        new TextDisplayBuilder().setContent(`${playerState?.position || '0:00'} / ${currentTrack.duration || 'Unknown'}`)
                    );
                    container.addSectionComponents(safeSection);
                } else {
                    // Validate section before adding - ensure no undefined accessories
                    try {
                        section.toJSON();
                        container.addSectionComponents(section);
                    } catch (error) {
                        console.error('Error validating section, creating section without accessory:', error);
                        // Create a new section without any accessory using our helper
                        const safeSection = createSectionWithoutAccessory(
                            new TextDisplayBuilder().setContent(`**${currentTrack.title}**`),
                            new TextDisplayBuilder().setContent(`${playerState?.position || '0:00'} / ${currentTrack.duration || 'Unknown'}`)
                        );
                        container.addSectionComponents(safeSection);
                    }
                }
            }
        }
        
        // All player controls in one row
        const controlRow = new ActionRowBuilder();
        
        // Loop button
        const repeatEmoji = this.getRepeatEmoji(playerState?.repeatMode);
        controlRow.addComponents(
            ButtonFactory.createSecondaryButton(
                'loop', 
                '', 
                repeatEmoji
            ).setStyle(playerState?.repeatMode !== 'off' ? ButtonStyle.Success : ButtonStyle.Secondary)
        );
        
        // Back button
        controlRow.addComponents(
            ButtonFactory.createSecondaryButton('back', '', '⏮️')
        );
        
        // Pause/Resume button
        controlRow.addComponents(
            ButtonFactory.createPrimaryButton(
                'pause', 
                '', 
                playerState?.paused ? '▶️' : '⏸️'
            )
        );
        
        // Skip button
        controlRow.addComponents(
            ButtonFactory.createSecondaryButton('skip', '', '⏭️')
        );
        
        // Shuffle button
        controlRow.addComponents(
            ButtonFactory.createSecondaryButton('shuffle', '', '🔀')
        );
        
        container.addActionRowComponents(controlRow);
        
        // Queue preview - just names
        if (queue && queue.length > 0) {
            container.addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            );
            
            const queueArray = Array.isArray(queue) ? queue : Array.from(queue);
            const upNext = queueArray.slice(0, 5);
            const queueText = upNext.map((track, index) => 
                `${track.title || track.name || 'Unknown'}`
            ).join(', ');
            
            const remaining = queueArray.length - 5;
            const queueDisplay = remaining > 0 
                ? `${queueText} and ${remaining} more`
                : queueText;
            
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**Queue:** ${queueDisplay}`)
            );
        }
        
        // Validate container before returning to ensure no undefined accessories
        try {
            // Test serialization to catch any undefined accessory errors early
            container.toJSON();
        } catch (error) {
            console.error('Container validation error, attempting to fix:', error);
            // If validation fails, try to create a minimal valid container
            const fallbackContainer = new ContainerBuilder().setAccentColor(accentColor);
            fallbackContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**${currentTrack?.title || 'Unknown Track'}**`)
            );
            container = fallbackContainer;
        }

        const response = {
            components: [container],
            flags: MessageFlags.IsComponentsV2
        };
        
        // Add canvas image as attachment if available
        if (playerImage) {
            response.files = [playerImage];
        }
        
        return response;
    }
    
    static createProgressBar(current, total, length = 20) {
        // Convert time strings to seconds for calculation
        const currentSeconds = this.timeToSeconds(current);
        const totalSeconds = this.timeToSeconds(total);
        
        if (isNaN(currentSeconds) || isNaN(totalSeconds) || totalSeconds === 0) {
            const bar = '█'.repeat(0) + '░'.repeat(length);
            return `\`${bar}\``;
        }
        
        const progress = Math.floor((currentSeconds / totalSeconds) * length);
        const bar = '█'.repeat(progress) + '░'.repeat(length - progress);
        return `\`${bar}\``;
    }
    
    static timeToSeconds(timeString) {
        if (!timeString) return 0;
        
        // Handle format like "3:45" or "1:23:45"
        const parts = timeString.split(':').map(Number);
        if (parts.some(isNaN)) return 0;
        
        if (parts.length === 2) {
            // MM:SS
            return parts[0] * 60 + parts[1];
        } else if (parts.length === 3) {
            // HH:MM:SS
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
        
        return 0;
    }
    
    static getRepeatEmoji(repeatMode) {
        switch (repeatMode) {
            case 'track': return '🔂';
            case 'queue': return '🔁';
            default: return '▶️';
        }
    }
}

module.exports = MusicPlayer;