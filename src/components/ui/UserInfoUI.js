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

class UserInfoUI {
    /**
     * Creates a user information interface
     * @param {Object} client - The Discord client
     * @param {Object} user - The Discord user
     * @param {Object} member - The Discord guild member (optional)
     * @param {Object} userData - User data object
     * @returns {Object} Message payload with components and flags
     */
    static createUserInfoInterface(client, user, member, userData) {
        const accentColor = this.getAccentColor(client);
        
        const container = new ContainerBuilder()
            .setAccentColor(accentColor)
            
            // Header with user avatar
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# ${user.tag}`),
                        new TextDisplayBuilder().setContent(userData.globalName ? `**Global Name:** ${userData.globalName}` : 'User Information')
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(user.displayAvatarURL({ size: 256 }))
                            .setDescription(`${user.tag}'s avatar`)
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
                            `**User:** ${user}\n` +
                            `**ID:** \`${user.id}\`\n` +
                            `**Account Created:** ${userData.created}`
                        )
                    )
            );

        // Add server-specific info if member exists
        if (member) {
            container.addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent('**Server Information**'),
                        new TextDisplayBuilder().setContent(
                            `**Joined Server:** ${userData.joined}\n` +
                            `**Roles:** ${userData.rolesCount} roles\n` +
                            `**Highest Role:** ${userData.highestRole || 'None'}`
                        )
                    )
            );
        }

        // Add roles if available
        if (userData.roles && userData.roles.length > 0) {
            container.addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('**Roles:** ' + userData.roles)
            );
        }

        // Add permissions if available
        if (userData.permissions && userData.permissions.length > 0) {
            container.addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('**Key Permissions:** ' + userData.permissions)
            );
        }

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

module.exports = UserInfoUI;

