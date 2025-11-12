const {
  Message,
  PermissionFlagsBits,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder
} = require("discord.js");
const pSchema = require("../../models/PrefixSchema.js");

// Import our new UI components
const ConfigUI = require("../../components/ui/ConfigUI");
const CommandResponse = require("../../components/ui/CommandResponse");

module.exports = {
  name: "prefix",
  aliases: ["set-prefix", "setprefix"],
  description: "Change the bot's command prefix",
  userPermissions: PermissionFlagsBits.ManageGuild,
  botPermissions: PermissionFlagsBits.SendMessages,
  cooldowns: 5,
  category: "Config",
  premium: false,

  run: async (client, message, args) => {
    const tick = "<:titan_tick:1425843673534562334>";
    const cross = "<:titan_crossmark:1425843965185359904>";

    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      const response = CommandResponse.createErrorResponse(
        "Missing Permissions",
        "You don't have permission to change the prefix."
      );
      return message.channel.send(response);
    }

    const newPrefix = args[0];
    if (!newPrefix) {
      const response = CommandResponse.createErrorResponse(
        "Missing Prefix",
        "Please provide a new prefix."
      );
      return message.channel.send({ ...response, allowedMentions: { repliedUser: false } });
    }

    if (newPrefix.length > 5) {
      const response = CommandResponse.createErrorResponse(
        "Prefix Too Long",
        "Prefix too long. Maximum 5 characters allowed."
      );
      return message.channel.send({ ...response, allowedMentions: { repliedUser: false } });
    }

    // Create confirmation interface using our new UI
    const container = new ContainerBuilder()
      .setAccentColor(parseInt(client.color.replace('#', ''), 16))
      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent(`# Prefix Change\nYou requested to set the prefix to \`${newPrefix}\`.\nDo you want to apply this change?`)
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("confirm_prefix")
        .setLabel("Set Prefix")
        .setEmoji(tick)
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("cancel_prefix")
        .setLabel("Cancel")
        .setEmoji(cross)
        .setStyle(ButtonStyle.Danger)
    );

    const msg = await message.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
      components: [row],
      allowedMentions: { repliedUser: false }
    });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 15000,
      max: 1
    });

    collector.on("collect", async (interaction) => {
      if (interaction.user.id !== message.author.id) {
        const response = CommandResponse.createErrorResponse(
          "Access Denied",
          "Only the command author can respond."
        );
        return interaction.reply({ ...response, ephemeral: true });
      }

      if (interaction.customId === "confirm_prefix") {
        let data = await pSchema.findOne({ serverId: message.guild.id });

        if (!data) {
          data = new pSchema({ serverId: message.guild.id, prefix: newPrefix });
          await data.save();
        } else {
          await data.updateOne({ prefix: newPrefix });
        }

        const botMember = await message.guild.members.fetch(client.user.id).catch(() => null);
        if (botMember && botMember.manageable) {
          const newNick = `Floovi [${newPrefix}]`;
          await botMember.setNickname(newNick).catch(() => {});
        }

        const response = CommandResponse.createSuccessResponse(
          "Prefix Updated",
          `Prefix successfully set to \`${newPrefix}\`.`
        );
        await interaction.update({ ...response, components: [] });
      } else if (interaction.customId === "cancel_prefix") {
        const response = CommandResponse.createWarningResponse(
          "Cancelled",
          "Prefix change cancelled."
        );
        await interaction.update({ ...response, components: [] });
      }
    });

    collector.on("end", async (collected) => {
      if (collected.size === 0) {
        const response = CommandResponse.createWarningResponse(
          "Timeout",
          "No response received. Prefix change request timed out."
        );
        await msg.edit({ ...response, components: [] });
      }
    });
  }
};