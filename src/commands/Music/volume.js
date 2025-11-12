const CommandResponse = require("../../components/ui/CommandResponse");
const { 
    ContainerBuilder, 
    TextDisplayBuilder, 
    SectionBuilder, 
    SeparatorBuilder, 
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

module.exports = {
  name: "volume",
  aliases: ["vol", "v"],
  description: `Control the volume of the song.`,
  category: "Music",
  cooldown: 5,
  inVc: true,
  sameVc: true,
  dj: true,

  run: async (client, message, args, prefix, player) => {
    if (!player) {
      const response = CommandResponse.createErrorResponse(
        "No Player Found",
        "There's no active music player right now.\nPlay something first to adjust volume."
      );
      return message.reply(response);
    }

    const currentVolume = player.volume || player.options?.volume || 100;

    if (!args[0]) {
      // Show current volume with controls
      const accentColor = client.color ? (typeof client.color === 'string' ? parseInt(client.color.replace('#', ''), 16) : client.color) : 0x2b2d31;
      
      const container = new ContainerBuilder()
        .setAccentColor(accentColor)
        .addSectionComponents(
          new SectionBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent('# 🔊 Volume Control'),
              new TextDisplayBuilder().setContent(`**Current Volume:** \`${currentVolume}%\``)
            )
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Large)
            .setDivider(true)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `Use \`${prefix}volume <amount>\` to set volume (1-200)\n` +
            `Or use the buttons below for quick adjustments.`
          )
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Large)
            .setDivider(true)
        );

      const vol10 = new ButtonBuilder()
        .setCustomId('vol_10')
        .setLabel('10%')
        .setStyle(ButtonStyle.Secondary);

      const vol50 = new ButtonBuilder()
        .setCustomId('vol_50')
        .setLabel('50%')
        .setStyle(ButtonStyle.Secondary);

      const vol100 = new ButtonBuilder()
        .setCustomId('vol_100')
        .setLabel('100%')
        .setStyle(ButtonStyle.Primary);

      const vol150 = new ButtonBuilder()
        .setCustomId('vol_150')
        .setLabel('150%')
        .setStyle(ButtonStyle.Secondary);

      const vol200 = new ButtonBuilder()
        .setCustomId('vol_200')
        .setLabel('200%')
        .setStyle(ButtonStyle.Secondary);

      container.addActionRowComponents(
        new ActionRowBuilder().addComponents(vol10, vol50, vol100, vol150, vol200)
      );

      const msg = await message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });

      // Set up button collector
      const collector = msg.createMessageComponentCollector({
        filter: i => i.user.id === message.author.id,
        time: 30000
      });

      collector.on('collect', async (interaction) => {
        if (!interaction.isButton()) return;
        await interaction.deferUpdate();

        const volumeMap = {
          'vol_10': 10,
          'vol_50': 50,
          'vol_100': 100,
          'vol_150': 150,
          'vol_200': 200
        };

        const newVolume = volumeMap[interaction.customId];
        if (newVolume) {
          player.setVolume(newVolume);
          const response = CommandResponse.createSuccessResponse(
            "Volume Updated",
            `Volume successfully set to **${newVolume}%**.\nEnjoy your music at the perfect level!`
          );
          await msg.edit(response);
        }
      });

      collector.on('end', () => {
        msg.edit({ components: [] }).catch(() => {});
      });

      return;
    }

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 200) {
      const response = CommandResponse.createErrorResponse(
        "Invalid Volume",
        "Please enter a valid number between **1** and **200**."
      );
      return message.reply(response);
    }

    if (currentVolume === amount) {
      const response = CommandResponse.createWarningResponse(
        "Volume Unchanged",
        `Volume is already set to **${amount}%**.\nNo change needed.`
      );
      return message.reply(response);
    }

    player.setVolume(amount);

    const response = CommandResponse.createSuccessResponse(
      "Volume Updated",
      `Volume successfully updated to **${amount}%**.\nEnjoy your music at the perfect level!`
    );

    return message.reply(response);
  },
};