const { 
    ContainerBuilder, 
    TextDisplayBuilder, 
    SectionBuilder, 
    SeparatorBuilder, 
    SeparatorSpacingSize,
    ButtonBuilder, 
    ButtonStyle,
    ActionRowBuilder,
    MessageFlags
} = require('discord.js');

const ContainerFactory = require('../utils/ContainerFactory');
const ButtonFactory = require('../utils/ButtonFactory');
const SectionFactory = require('../utils/SectionFactory');

class CommandResponse {
    static createSuccessResponse(title, message, details = '') {
        const container = ContainerFactory.createSuccessContainer();
        ContainerFactory.addHeader(container, title);
        ContainerFactory.addSection(container, 'Success', message);
        
        if (details) {
            ContainerFactory.addSeparator(container);
            ContainerFactory.addSection(container, 'Details', details);
        }
        
        return ContainerFactory.buildResponse(container);
    }

    static createErrorResponse(title, error, details = '') {
        const container = ContainerFactory.createErrorContainer();
        ContainerFactory.addHeader(container, title);
        ContainerFactory.addSection(container, 'Error', error);
        
        if (details) {
            ContainerFactory.addSeparator(container);
            ContainerFactory.addSection(container, 'Details', details);
        }
        
        return ContainerFactory.buildResponse(container);
    }

    static createInfoResponse(title, message, details = '') {
        const container = ContainerFactory.createPrimaryContainer();
        ContainerFactory.addHeader(container, title);
        ContainerFactory.addSection(container, 'Information', message);
        
        if (details) {
            ContainerFactory.addSeparator(container);
            ContainerFactory.addSection(container, 'Details', details);
        }
        
        return ContainerFactory.buildResponse(container);
    }

    static createWarningResponse(title, message, details = '') {
        const container = ContainerFactory.createWarningContainer();
        ContainerFactory.addHeader(container, title);
        ContainerFactory.addSection(container, 'Warning', message);
        
        if (details) {
            ContainerFactory.addSeparator(container);
            ContainerFactory.addSection(container, 'Details', details);
        }
        
        return ContainerFactory.buildResponse(container);
    }

    static createConfirmationResponse(title, message, confirmButton, cancelButton) {
        const container = ContainerFactory.createPrimaryContainer();
        ContainerFactory.addHeader(container, title);
        ContainerFactory.addSection(container, 'Confirmation', message);
        
        const actionRow = new ActionRowBuilder();
        actionRow.addComponents(confirmButton, cancelButton);
        container.addActionRowComponents(actionRow);
        
        return ContainerFactory.buildResponse(container);
    }

    static createListResponse(title, items, itemType = 'Item') {
        const container = ContainerFactory.createPrimaryContainer();
        ContainerFactory.addHeader(container, title);
        
        if (items.length === 0) {
            ContainerFactory.addSection(container, 'No Items', `No ${itemType.toLowerCase()} found.`);
        } else {
            const itemsText = items.map((item, index) => 
                `${index + 1}. **${item.title || item.name || 'Untitled'}**\n${item.description || item.value || ''}`
            ).join('\n\n');
            
            ContainerFactory.addSection(container, `${itemType}s`, itemsText);
        }
        
        return ContainerFactory.buildResponse(container);
    }

    static createProfileResponse(user, guild) {
        const container = ContainerFactory.createPrimaryContainer();
        ContainerFactory.addHeader(container, `User Profile: ${user.username}`);
        
        const userInfo = [
            `**ID**: ${user.id}`,
            `**Created**: ${user.createdAt?.toDateString() || 'Unknown'}`,
            `**Bot**: ${user.bot ? 'Yes' : 'No'}`,
            guild ? `**Guild Join Date**: ${guild.joinedAt?.toDateString() || 'Unknown'}` : ''
        ].filter(Boolean).join('\n');
        
        const section = SectionFactory.createProfileSection(
            'User Information',
            userInfo,
            user.avatarURL?.() || null,
            `${user.username}'s avatar`
        );
        
        container.addSectionComponents(section);
        
        return ContainerFactory.buildResponse(container);
    }
}

module.exports = CommandResponse;