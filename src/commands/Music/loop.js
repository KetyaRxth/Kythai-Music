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
  name: "loop",
  aliases: ["loopstart"],
  description: `Loop a song or queue!`,
  category: "Music",
  cooldown: 5,
  inVc: true,
  sameVc: true,
  premium: false,
  dj: true,
  
  run: async (client, message, args, prefix, player) => {
    if (!player) {
      const response = CommandResponse.createErrorResponse(
        "No Player Found",
        "No Player Found For This Guild!"
      );
      return message.channel.send(response);
    }

    const currentLoop = player.loop || "none";

    if (!args[0]) {
      // Show loop control UI
      const accentColor = client.color ? (typeof client.color === 'string' ? parseInt(client.color.replace('#', ''), 16) : client.color) : 0x2b2d31;
      
      const container = new ContainerBuilder()
        .setAccentColor(accentColor)
        .addSectionComponents(
          new SectionBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent('# 🔁 Loop Control'),
              new TextDisplayBuilder().setContent(
                `**Current Mode:** \`${currentLoop === 'track' ? 'Track Loop' : currentLoop === 'queue' ? 'Queue Loop' : 'Off'}\`\n\n` +
                `Use \`${prefix}loop current\` to loop the current song\n` +
                `Use \`${prefix}loop queue\` to loop the entire queue`
              )
            )
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Large)
            .setDivider(true)
        );

      const trackLoopBtn = new ButtonBuilder()
        .setCustomId('loop_track')
        .setLabel('Loop Track')
        .setStyle(currentLoop === 'track' ? ButtonStyle.Success : ButtonStyle.Secondary)
        .setEmoji('🔂');

      const queueLoopBtn = new ButtonBuilder()
        .setCustomId('loop_queue')
        .setLabel('Loop Queue')
        .setStyle(currentLoop === 'queue' ? ButtonStyle.Success : ButtonStyle.Secondary)
        .setEmoji('🔁');

      const offBtn = new ButtonBuilder()
        .setCustomId('loop_off')
        .setLabel('Turn Off')
        .setStyle(currentLoop === 'none' ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setEmoji('⏹️');

      container.addActionRowComponents(
        new ActionRowBuilder().addComponents(trackLoopBtn, queueLoopBtn, offBtn)
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

        switch (interaction.customId) {
          case 'loop_track':
            player.setLoop("track");
            const trackResponse = CommandResponse.createSuccessResponse(
              "Loop Enabled",
              "Song has been: **Looped**"
            );
            await msg.edit(trackResponse);
            break;

          case 'loop_queue':
            player.setLoop("queue");
            const queueResponse = CommandResponse.createSuccessResponse(
              "Queue Loop Enabled",
              "Loop all has been: **Enabled**"
            );
            await msg.edit(queueResponse);
            break;

          case 'loop_off':
            player.setLoop("none");
            const offResponse = CommandResponse.createSuccessResponse(
              "Loop Disabled",
              "Loop has been: **Disabled**"
            );
            await msg.edit(offResponse);
            break;
        }
      });

      collector.on('end', () => {
        msg.edit({ components: [] }).catch(() => {});
      });

      return;
    }

    const mode = args[0].toLowerCase();

    if (mode === "current" || mode === "track") {
      if (player.loop === "track") {
        player.setLoop("none");
        const response = CommandResponse.createSuccessResponse(
          "Loop Disabled",
          "Song has been: **Unlooped**"
        );
        return message.reply(response);
      } else {
        player.setLoop("track");
        const response = CommandResponse.createSuccessResponse(
          "Loop Enabled",
          "Song has been: **Looped**"
        );
        return message.reply(response);
      }
    } else if (mode === "queue") {
      if (player.loop === "queue") {
        player.setLoop("none");
        const response = CommandResponse.createSuccessResponse(
          "Queue Loop Disabled",
          "Loop all has been: **Disabled**"
        );
        return message.reply(response);
      } else {
        player.setLoop("queue");
        const response = CommandResponse.createSuccessResponse(
          "Queue Loop Enabled",
          "Loop all has been: **Enabled**"
        );
        return message.reply(response);
      }
    } else {
      const response = CommandResponse.createErrorResponse(
        "Invalid Mode",
        "What mode do you want to loop? Use `current` or `queue`"
      );
      return message.reply(response);
    }
  },
};
