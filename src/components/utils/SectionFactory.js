const { 
    SectionBuilder, 
    TextDisplayBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    ThumbnailBuilder
} = require('discord.js');

/**
 * Safely sets a button accessory on a section
 * @param {SectionBuilder} section - The section to set the accessory on
 * @param {ButtonBuilder|undefined} button - The button to set, or undefined to skip
 */
function safeSetButtonAccessory(section, button) {
    if (!section || !button) return;
    if (!ButtonBuilder || typeof ButtonBuilder !== 'function') return;
    if (!(button instanceof ButtonBuilder)) return;
    try {
        section.setButtonAccessory(button);
    } catch (error) {
        console.error('Error setting button accessory:', error);
    }
}

/**
 * Safely sets a thumbnail accessory on a section
 * @param {SectionBuilder} section - The section to set the accessory on
 * @param {ThumbnailBuilder|undefined} thumbnail - The thumbnail to set, or undefined to skip
 */
function safeSetThumbnailAccessory(section, thumbnail) {
    if (!section || !thumbnail) return;
    if (!ThumbnailBuilder || typeof ThumbnailBuilder !== 'function') return;
    if (!(thumbnail instanceof ThumbnailBuilder)) return;
    try {
        section.setThumbnailAccessory(thumbnail);
    } catch (error) {
        console.error('Error setting thumbnail accessory:', error);
    }
}

class SectionFactory {
    static createInfoSection(title, content, details = '') {
        const section = new SectionBuilder();
        
        const textDisplays = [
            new TextDisplayBuilder().setContent(`**${title}**`)
        ];
        
        if (content) {
            textDisplays.push(new TextDisplayBuilder().setContent(content));
        }
        
        if (details) {
            textDisplays.push(new TextDisplayBuilder().setContent(details));
        }
        
        return section.addTextDisplayComponents(...textDisplays);
    }

    static createActionSection(title, content, button) {
        const section = new SectionBuilder();
        
        const textDisplays = [
            new TextDisplayBuilder().setContent(`**${title}**`)
        ];
        
        if (content) {
            textDisplays.push(new TextDisplayBuilder().setContent(content));
        }
        
        section.addTextDisplayComponents(...textDisplays);
        
        // Safely set button accessory
        safeSetButtonAccessory(section, button);
        
        return section;
    }

    static createProfileSection(title, content, thumbnailUrl, thumbnailDescription = '') {
        const section = new SectionBuilder();
        
        const textDisplays = [
            new TextDisplayBuilder().setContent(`**${title}**`)
        ];
        
        if (content) {
            textDisplays.push(new TextDisplayBuilder().setContent(content));
        }
        
        section.addTextDisplayComponents(...textDisplays);
        
        // Safely set thumbnail accessory if thumbnailUrl is provided
        if (thumbnailUrl && ThumbnailBuilder && typeof ThumbnailBuilder === 'function') {
            try {
                const thumbnail = new ThumbnailBuilder()
                    .setURL(thumbnailUrl);
                
                if (thumbnailDescription) {
                    thumbnail.setDescription(thumbnailDescription);
                }
                
                safeSetThumbnailAccessory(section, thumbnail);
            } catch (error) {
                console.error('Error creating thumbnail accessory:', error);
            }
        }
        
        return section;
    }

    static createStatusSection(status, message, button = null) {
        const statusColors = {
            success: ButtonStyle.Success,
            warning: ButtonStyle.Secondary,
            error: ButtonStyle.Danger,
            info: ButtonStyle.Primary
        };
        
        const statusEmojis = {
            success: '✅',
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️'
        };
        
        const section = new SectionBuilder();
        
        section.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`**Status Update**`),
            new TextDisplayBuilder().setContent(`${statusEmojis[status] || ''} ${message}`)
        );
        
        // Safely set button accessory
        safeSetButtonAccessory(section, button);
        
        return section;
    }
}

module.exports = SectionFactory;