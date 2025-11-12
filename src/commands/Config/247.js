const {
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
const reconnectAuto = require("../../models/reconnect.js");

// Import our new UI components
const ConfigUI = require("../../components/ui/ConfigUI");
const CommandResponse = require("../../components/ui/CommandResponse");

module.exports = {
  name: "24/7",
  aliases: ["247", "tfs", "wentyfourseven"],
  description: "Toggle 24/7 mode in your voice channel",
  userPermissions: PermissionFlagsBits.ManageGuild,
  botPermissions: PermissionFlagsBits.Speak,
  cooldowns: 5,
  category: "Config",
  inVc: true,
  sameVc: true,
  voteOnly: false,
  premium: false,

  run: async (client, message, args) => {
    const tick = "<:titan_tick:1425843673534562334>";
    const cross = "<:titan_crossmark:1425843965185359904>";

    const voiceChannel = message.member.voice.channel;
    const botPerms = voiceChannel.permissionsFor(message.guild.members.me);

    if (!botPerms.has(PermissionsBitField.Flags.ViewChannel))
      return message.reply(
        CommandResponse.createErrorResponse(
          "Missing Permissions",
          "I need **View Channel** permission in your voice channel."
        )
      );

    if (!botPerms.has(PermissionsBitField.Flags.Connect))
      return message.reply(
        CommandResponse.createErrorResponse(
          "Missing Permissions",
          "I need **Connect** permission in your voice channel."
        )
      );

    if (!botPerms.has(PermissionsBitField.Flags.Speak))
      return message.reply(
        CommandResponse.createErrorResponse(
          "Missing Permissions",
          "I need **Speak** permission in your voice channel."
        )
      );

    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild))
      return message.reply(
        CommandResponse.createErrorResponse(
          "Missing Permissions",
          "You must have **Manage Server** permission to toggle 24/7 mode."
        )
      );

    // Check if 24/7 is already enabled
    const data = await reconnectAuto.findOne({ GuildId: message.guild.id });
    
    // Create the 24/7 configuration interface
    const response = ConfigUI.create247ConfigInterface(
      message.guild.id,
      !!data,
      voiceChannel,
      message.channel
    );

    const msg = await message.channel.send(response);

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 15000,
      max: 1,
    });

    collector.on("collect", async (interaction) => {
      if (interaction.user.id !== message.author.id) {
        const response = CommandResponse.createErrorResponse(
          "Access Denied",
          "Only the person who used the command can interact."
        );
        return interaction.reply({ ...response, ephemeral: true });
      }

      const data = await reconnectAuto.findOne({ GuildId: message.guild.id });

      if (interaction.customId === "enable_247") {
        if (data) {
          const response = CommandResponse.createWarningResponse(
            "Already Enabled",
            "24/7 mode is already **enabled** in this server."
          );
          return interaction.update({ ...response, components: [] });
        }

        await reconnectAuto.create({
          GuildId: message.guild.id,
          TextId: message.channel.id,
          VoiceId: voiceChannel.id,
        });

        await client.manager.createPlayer({
          guildId: message.guild.id,
          textId: message.channel.id,
          voiceId: voiceChannel.id,
          volume: 100,
          deaf: true,
          shardId: message.guild.shardId,
        });

        const response = CommandResponse.createSuccessResponse(
          "24/7 Enabled",
          `24/7 mode has been **enabled** in \`${voiceChannel.name}\`.`
        );
        return interaction.update({ ...response, components: [] });
      }

      if (interaction.customId === "disable_247") {
        if (!data) {
          const response = CommandResponse.createWarningResponse(
            "Already Disabled",
            "24/7 mode is already **disabled** in this server."
          );
          return interaction.update({ ...response, components: [] });
        }

        await reconnectAuto.findOneAndDelete({ GuildId: message.guild.id });

        const response = CommandResponse.createSuccessResponse(
          "24/7 Disabled",
          `24/7 mode has been **disabled** in \`${voiceChannel.name}\`.`
        );
        return interaction.update({ ...response, components: [] });
      }
    });

    collector.on("end", async (collected) => {
      if (collected.size === 0) {
        const response = CommandResponse.createWarningResponse(
          "Timeout",
          "You didn't choose any option in time. 24/7 setup session ended."
        );
        await msg.edit({ ...response, components: [] });
      }
    });
  },
};