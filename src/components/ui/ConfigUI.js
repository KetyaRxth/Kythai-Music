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

class ConfigUI {
    static create247ConfigInterface(guildId, is247Enabled, voiceChannel, textChannel) {
        const container = ContainerFactory.createPrimaryContainer();
        ContainerFactory.addHeader(container, '24/7 Configuration', 'Configure the bot to stay in your voice channel 24/7');
        
        // Status section
        const statusSection = SectionFactory.createStatusSection(
            is247Enabled ? 'success' : 'info',
            is247Enabled ? '24/7 mode is currently **enabled**' : '24/7 mode is currently **disabled**'
        );
        container.addSectionComponents(statusSection);
        
        // Configuration details
        if (is247Enabled && voiceChannel) {
            ContainerFactory.addSeparator(container);
            
            const configSection = new SectionBuilder();
            configSection.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('**Current Configuration**'),
                new TextDisplayBuilder().setContent(`**Voice Channel**: ${voiceChannel.name || 'Unknown'}\n**Text Channel**: ${textChannel?.name || 'Unknown'}`)
            );
            container.addSectionComponents(configSection);
        }
        
        // Action buttons
        ContainerFactory.addSeparator(container, SeparatorSpacingSize.Large, true);
        
        const actionRow = new ActionRowBuilder();
        
        if (is247Enabled) {
            actionRow.addComponents(
                ButtonFactory.createDangerButton(`247_disable_${guildId}`, 'Disable 24/7', '❌')
            );
        } else {
            actionRow.addComponents(
                ButtonFactory.createSuccessButton(`247_enable_${guildId}`, 'Enable 24/7', '✅')
            );
        }
        
        actionRow.addComponents(
            ButtonFactory.createSecondaryButton(`247_info_${guildId}`, 'Info', 'ℹ️')
        );
        
        container.addActionRowComponents(actionRow);
        
        return ContainerFactory.buildResponse(container);
    }

    static createPrefixConfigInterface(guildId, currentPrefix) {
        const container = ContainerFactory.createPrimaryContainer();
        ContainerFactory.addHeader(container, 'Prefix Configuration', 'Set a custom prefix for the bot');
        
        // Current prefix section
        const prefixSection = new SectionBuilder();
        prefixSection.addTextDisplayComponents(
            new TextDisplayBuilder().setContent('**Current Prefix**'),
            new TextDisplayBuilder().setContent(`\`${currentPrefix}\``)
        );
        container.addSectionComponents(prefixSection);
        
        // Instructions
        ContainerFactory.addSeparator(container);
        ContainerFactory.addSection(container, 'Instructions', 'Use the command below to change the prefix:\n```\n?prefix <new_prefix>\n```');
        
        // Action buttons
        ContainerFactory.addSeparator(container, SeparatorSpacingSize.Large, true);
        
        const actionRow = new ActionRowBuilder();
        actionRow.addComponents(
            ButtonFactory.createSecondaryButton(`prefix_reset_${guildId}`, 'Reset to Default', '🔄'),
            ButtonFactory.createSecondaryButton(`prefix_info_${guildId}`, 'Info', 'ℹ️')
        );
        
        container.addActionRowComponents(actionRow);
        
        return ContainerFactory.buildResponse(container);
    }

    static createDJRoleConfigInterface(guildId, djRole, isAdmin) {
        const container = ContainerFactory.createPrimaryContainer();
        ContainerFactory.addHeader(container, 'DJ Role Configuration', 'Set a role that can use DJ commands');
        
        // Current role section
        const roleSection = new SectionBuilder();
        if (djRole) {
            roleSection.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('**Current DJ Role**'),
                new TextDisplayBuilder().setContent(`<@&${djRole.id}>`)
            );
        } else {
            roleSection.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('**Current DJ Role**'),
                new TextDisplayBuilder().setContent('No DJ role set')
            );
        }
        container.addSectionComponents(roleSection);
        
        // Permissions note
        ContainerFactory.addSeparator(container);
        ContainerFactory.addSection(container, 'Permissions', isAdmin ? 
            'You have administrator permissions and can use all commands regardless of the DJ role.' : 
            'Only users with the DJ role or administrator permissions can use DJ commands.');
        
        // Action buttons
        ContainerFactory.addSeparator(container, SeparatorSpacingSize.Large, true);
        
        const actionRow = new ActionRowBuilder();
        actionRow.addComponents(
            ButtonFactory.createPrimaryButton(`djrole_set_${guildId}`, 'Set Role', '🏷️'),
            ButtonFactory.createDangerButton(`djrole_remove_${guildId}`, 'Remove Role', '🗑️'),
            ButtonFactory.createSecondaryButton(`djrole_info_${guildId}`, 'Info', 'ℹ️')
        );
        
        container.addActionRowComponents(actionRow);
        
        return ContainerFactory.buildResponse(container);
    }

    static createIgnoreChannelConfigInterface(guildId, ignoredChannels) {
        const container = ContainerFactory.createPrimaryContainer();
        ContainerFactory.addHeader(container, 'Ignore Channels', 'Configure channels where the bot will ignore commands');
        
        // Ignored channels section
        if (ignoredChannels.length > 0) {
            const channelsText = ignoredChannels.map(channel => 
                `<#${channel.id}> (${channel.name})`
            ).join('\n');
            
            ContainerFactory.addSection(container, 'Ignored Channels', channelsText);
        } else {
            ContainerFactory.addSection(container, 'Ignored Channels', 'No channels are currently ignored');
        }
        
        // Instructions
        ContainerFactory.addSeparator(container);
        ContainerFactory.addSection(container, 'Instructions', 'Use the commands below to manage ignored channels:\n```\n?ignore add #channel\n?ignore remove #channel\n?ignore list\n```');
        
        // Action buttons
        ContainerFactory.addSeparator(container, SeparatorSpacingSize.Large, true);
        
        const actionRow = new ActionRowBuilder();
        actionRow.addComponents(
            ButtonFactory.createPrimaryButton(`ignore_add_${guildId}`, 'Add Channel', '➕'),
            ButtonFactory.createDangerButton(`ignore_clear_${guildId}`, 'Clear All', '🗑️'),
            ButtonFactory.createSecondaryButton(`ignore_info_${guildId}`, 'Info', 'ℹ️')
        );
        
        container.addActionRowComponents(actionRow);
        
        return ContainerFactory.buildResponse(container);
    }
}

module.exports = ConfigUI;