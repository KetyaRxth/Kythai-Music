const { ContainerBuilder, SectionBuilder } = require('discord.js');

/**
 * Validates and cleans a container to ensure no sections have undefined accessories
 * @param {ContainerBuilder} container - The container to validate
 * @returns {ContainerBuilder} - The validated container
 */
function validateContainer(container) {
    if (!container || !(container instanceof ContainerBuilder)) {
        return container;
    }

    try {
        // Get the internal data to check sections
        const containerData = container.toJSON();
        
        // If there are sections, validate them
        if (containerData.components) {
            containerData.components.forEach((component, index) => {
                if (component.type === 10) { // Section component type
                    // Check if accessory is undefined
                    if (component.accessory === undefined || component.accessory === null) {
                        // Remove the undefined accessory by not including it
                        delete component.accessory;
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error validating container:', error);
    }

    return container;
}

/**
 * Validates a section to ensure it doesn't have undefined accessories
 * @param {SectionBuilder} section - The section to validate
 * @returns {SectionBuilder|undefined} - The validated section, or undefined if invalid
 */
function validateSection(section) {
    if (!section || !(section instanceof SectionBuilder)) {
        return section;
    }

    try {
        const sectionData = section.toJSON();
        
        // Check if accessory is undefined
        if (sectionData.accessory === undefined || sectionData.accessory === null) {
            // Create a new section without the accessory
            const newSection = new SectionBuilder();
            
            // Copy text displays
            if (sectionData.components) {
                sectionData.components.forEach(component => {
                    if (component.type === 11) { // TextDisplay type
                        newSection.addTextDisplayComponents(
                            require('discord.js').TextDisplayBuilder.from(component)
                        );
                    }
                });
            }
            
            return newSection;
        }
    } catch (error) {
        // If validation fails, return undefined to skip this section
        console.error('Error validating section:', error);
        return undefined;
    }

    return section;
}

module.exports = {
    validateContainer,
    validateSection
};

