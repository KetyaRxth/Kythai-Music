const { 
    ContainerBuilder, 
    TextDisplayBuilder, 
    SeparatorBuilder, 
    SeparatorSpacingSize,
    MessageFlags 
} = require('discord.js');

class ContainerFactory {
    static createPrimaryContainer(accentColor = 0x5865F2) {
        return new ContainerBuilder().setAccentColor(accentColor);
    }

    static createSuccessContainer() {
        return new ContainerBuilder().setAccentColor(0x57F287);
    }

    static createWarningContainer() {
        return new ContainerBuilder().setAccentColor(0xFEE75C);
    }

    static createErrorContainer() {
        return new ContainerBuilder().setAccentColor(0xED4245);
    }

    static addHeader(container, title, subtitle = '') {
        let content = `# ${title}`;
        if (subtitle) {
            content += `\n${subtitle}`;
        }
        return container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(content)
        );
    }

    static addSection(container, title, content) {
        return container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`**${title}**`),
            new TextDisplayBuilder().setContent(content)
        );
    }

    static addSeparator(container, size = SeparatorSpacingSize.Small, divider = false) {
        return container.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(size).setDivider(divider)
        );
    }

    static buildResponse(container) {
        return {
            components: [container],
            flags: MessageFlags.IsComponentsV2
        };
    }
}

module.exports = ContainerFactory;