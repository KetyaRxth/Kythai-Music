const { ButtonBuilder, ButtonStyle } = require('discord.js');

class ButtonFactory {
    static createPrimaryButton(customId, label, emoji = null) {
        const button = new ButtonBuilder()
            .setCustomId(customId)
            .setStyle(ButtonStyle.Primary);
        
        // Validate and set emoji if provided
        if (emoji && typeof emoji === 'string' && emoji.trim() !== '') {
            button.setEmoji(emoji);
        }
        
        // Set label if provided and not empty
        if (label !== undefined && label !== '' && typeof label === 'string') {
            button.setLabel(label);
        } else if (!emoji || (typeof emoji !== 'string' || emoji.trim() === '')) {
            // If no valid emoji and no label, set a default label to avoid validation errors
            button.setLabel('Button');
        }
        
        return button;
    }

    static createSecondaryButton(customId, label, emoji = null) {
        const button = new ButtonBuilder()
            .setCustomId(customId)
            .setStyle(ButtonStyle.Secondary);
        
        // Validate and set emoji if provided
        if (emoji && typeof emoji === 'string' && emoji.trim() !== '') {
            button.setEmoji(emoji);
        }
        
        // Set label if provided and not empty
        if (label !== undefined && label !== '' && typeof label === 'string') {
            button.setLabel(label);
        } else if (!emoji || (typeof emoji !== 'string' || emoji.trim() === '')) {
            // If no valid emoji and no label, set a default label to avoid validation errors
            button.setLabel('Button');
        }
        
        return button;
    }

    static createSuccessButton(customId, label, emoji = null) {
        const button = new ButtonBuilder()
            .setCustomId(customId)
            .setStyle(ButtonStyle.Success);
        
        // Validate and set emoji if provided
        if (emoji && typeof emoji === 'string' && emoji.trim() !== '') {
            button.setEmoji(emoji);
        }
        
        // Set label if provided and not empty
        if (label !== undefined && label !== '' && typeof label === 'string') {
            button.setLabel(label);
        } else if (!emoji || (typeof emoji !== 'string' || emoji.trim() === '')) {
            // If no valid emoji and no label, set a default label to avoid validation errors
            button.setLabel('Button');
        }
        
        return button;
    }

    static createDangerButton(customId, label, emoji = null) {
        const button = new ButtonBuilder()
            .setCustomId(customId)
            .setStyle(ButtonStyle.Danger);
        
        // Validate and set emoji if provided
        if (emoji && typeof emoji === 'string' && emoji.trim() !== '') {
            button.setEmoji(emoji);
        }
        
        // Set label if provided and not empty
        if (label !== undefined && label !== '' && typeof label === 'string') {
            button.setLabel(label);
        } else if (!emoji || (typeof emoji !== 'string' || emoji.trim() === '')) {
            // If no valid emoji and no label, set a default label to avoid validation errors
            button.setLabel('Button');
        }
        
        return button;
    }

    static createLinkButton(url, label, emoji = null) {
        const button = new ButtonBuilder()
            .setURL(url)
            .setStyle(ButtonStyle.Link);
        
        // Validate and set emoji if provided
        if (emoji && typeof emoji === 'string' && emoji.trim() !== '') {
            button.setEmoji(emoji);
        }
        
        // Set label if provided and not empty
        if (label !== undefined && label !== '' && typeof label === 'string') {
            button.setLabel(label);
        } else if (!emoji || (typeof emoji !== 'string' || emoji.trim() === '')) {
            // If no valid emoji and no label, set a default label to avoid validation errors
            button.setLabel('Button');
        }
        
        return button;
    }

    static createDisabledButton(style = ButtonStyle.Secondary, label = 'Disabled', emoji = null, customId = 'disabled_button') {
        const button = new ButtonBuilder()
            .setCustomId(customId)
            .setStyle(style)
            .setDisabled(true);
        
        // Validate and set emoji if provided
        if (emoji && typeof emoji === 'string' && emoji.trim() !== '') {
            button.setEmoji(emoji);
        }
        
        // Set label if provided and not empty
        if (label !== undefined && label !== '' && typeof label === 'string') {
            button.setLabel(label);
        } else if (!emoji || (typeof emoji !== 'string' || emoji.trim() === '')) {
            // If no valid emoji and no label, set a default label to avoid validation errors
            button.setLabel('Button');
        }
        
        return button;
    }
}

module.exports = ButtonFactory;