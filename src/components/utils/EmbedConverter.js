const { 
    ContainerBuilder, 
    TextDisplayBuilder, 
    SectionBuilder,
    MessageFlags
} = require('discord.js');

class EmbedConverter {
    static convertEmbedToContainer(embedData) {
        const container = new ContainerBuilder();
        
        // Set accent color if available
        if (embedData.color) {
            container.setAccentColor(embedData.color);
        }
        
        // Add title as header
        if (embedData.title) {
            const content = embedData.title;
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# ${content}`)
            );
        }
        
        // Add description as main content
        if (embedData.description) {
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(embedData.description)
            );
        }
        
        // Add fields as sections
        if (embedData.fields && embedData.fields.length > 0) {
            embedData.fields.forEach(field => {
                const section = new SectionBuilder();
                section.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`**${field.name}**`),
                    new TextDisplayBuilder().setContent(field.value)
                );
                container.addSectionComponents(section);
            });
        }
        
        // Add footer as additional text
        if (embedData.footer) {
            const footerText = embedData.footer.text;
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`*${footerText}*`)
            );
        }
        
        return {
            components: [container],
            flags: MessageFlags.IsComponentsV2
        };
    }
    
    static createResponseFromEmbed(embedData) {
        return this.convertEmbedToContainer(embedData);
    }
}

module.exports = EmbedConverter;