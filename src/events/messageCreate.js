const {
  EmbedBuilder,
  PermissionsBitField,
  Collection,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  WebhookClient,
  MessageFlags,
} = require("discord.js");
const PrefixSchema = require("../models/PrefixSchema.js");
const BlacklistUserSchema = require("../models/BlacklistUserSchema.js");
const BlacklistServerSchema = require("../models/BlacklistServerSchema.js");
const NoPrefixSchema = require("../models/NoPrefixSchema.js");
const DjRoleSchema = require("../models/DjroleSchema.js");
const SetupSchema = require("../models/SetupSchema.js");
const IgnoreChannelSchema = require("../models/IgnoreChannelSchema.js");
const RestrictionSchema = require("../models/RestrictionSchema.js");
const premiumUserSchema = require("../models/PremiumUserSchema.js");
const PremiumGuildSchema = require("../models/PremiumGuildSchema.js");

module.exports = async (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild || !message.id) return;

    const player = client.manager.players.get(message.guild.id);

    const updateData = await SetupSchema.findOne({ guildId: message.guild.id });
    if (updateData && updateData.channelId === message.channel.id) return;

    const isBlacklisted = await BlacklistUserSchema.findOne({ userId: message.author.id });
    if (isBlacklisted) return;

    const isServerBlacklisted = await BlacklistServerSchema.findOne({ serverId: message.guild.id });
    if (isServerBlacklisted) return;

    let prefix;
    let data = await PrefixSchema.findOne({ serverId: message.guild.id });
    prefix = data ? data.prefix : client.config.prefix;

    const npData = await NoPrefixSchema.findOne({ userId: message.author.id });
    message.guild.prefix = prefix;

    let regex = new RegExp(`<@!?${client.user.id}>`);
    let pre = message.content.match(regex) ? message.content.match(regex)[0] : prefix;
    if (!npData && !message.content.startsWith(pre)) return;

    let args = !npData
      ? message.content.slice(pre.length).trim().split(/ +/)
      : message.content.startsWith(pre)
      ? message.content.slice(pre.length).trim().split(/ +/)
      : message.content.trim().split(/ +/);

    const cmd = args.shift().toLowerCase();
    let botTag = `<@${client.user.id}>`;

    if (cmd.length === 0 && message.content === botTag) {
      // Create a Components v2 response for the prefix info
      const container = new (require("discord.js").ContainerBuilder)()
        .setAccentColor(parseInt(client.color.replace('#', ''), 16))
        .addTextDisplayComponents(
          new (require("discord.js").TextDisplayBuilder)()
            .setContent(`# Hello there!\nMy prefix is \`${prefix}\`. Use \`${prefix}help\` to see my commands.`)
        );
      
      return message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const command = client.mcommands.get(cmd) || client.mcommands.find(cmds => cmds.aliases && cmds.aliases.includes(cmd));
    if (!command) return;

    if (command.premium) {
      const premiumData = await PremiumGuildSchema.findOne({ Guild: message.guild.id });

      if (!premiumData) {
        // Create a Components v2 response for premium requirement
        const container = new (require("discord.js").ContainerBuilder)()
          .setAccentColor(parseInt(client.color.replace('#', ''), 16))
          .addTextDisplayComponents(
            new (require("discord.js").TextDisplayBuilder)()
              .setContent(`# Premium Required
Hello, ${message.author}!
You've just discovered one of the exclusive premium commands available on our bot.
This feature is reserved for our premium members who enjoy additional functionality, advanced tools, and priority access to new updates.
By upgrading to premium, you’ll unlock a wide range of exclusive features that can greatly enhance your experience.
If you're interested in accessing these premium benefits, feel free to check out our premium plans by visiting [this link](https://discord.gg/RPuK3n8YBT).
Thank you for being a valued user of our bot!`)
          );
        
        return message.reply({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
              .setStyle(ButtonStyle.Link)
              .setURL("https://discord.gg/RPuK3n8YBT")
              .setLabel("Premium")
            )
          ],
        });
      }

      if (!premiumData.Permanent && Date.now() > premiumData.Expire) {
        const expiredDuration = Math.floor((Date.now() - premiumData.Expire) / (1000 * 60 * 60 * 24));
        await PremiumGuildSchema.deleteOne({ Guild: message.guild.id });

        // Create a Components v2 response for expired premium
        const container = new (require("discord.js").ContainerBuilder)()
          .setAccentColor(parseInt(client.color.replace('#', ''), 16))
          .addTextDisplayComponents(
            new (require("discord.js").TextDisplayBuilder)()
              .setContent(`# Premium Expired\nYour Premium Subscription expired ${expiredDuration} days ago! Please renew to continue accessing premium features.`)
          );
        
        return message.reply({
          components: [container],
          flags: MessageFlags.IsComponentsV2
        });
      }
    }

    if (!client.config.ownerIDS.includes(message.author.id)) {
      if (!client.cooldowns) {
        client.cooldowns = new Collection();
      }
      if (!client.cooldowns.has(command.name)) {
        client.cooldowns.set(command.name, new Collection());
      }

      const now = Date.now();
      const timestamps = client.cooldowns.get(command.name);
      const cooldownAmount = (command.cooldown ? command.cooldown : 5) * 1000;

      if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          let commandCount = timestamps.get(`${message.author.id}_count`) || 0;
          commandCount++;
          timestamps.set(`${message.author.id}_count`, commandCount);

          if (commandCount > 5) {
            const checkisBlacklisted = await BlacklistUserSchema.findOne({ userId: message.author.id });
            if (!checkisBlacklisted) {
              await BlacklistUserSchema.create({ userId: message.author.id });
              // Create a Components v2 response for blacklist
              const container = new (require("discord.js").ContainerBuilder)()
                .setAccentColor(parseInt(client.color.replace('#', ''), 16))
                .addTextDisplayComponents(
                  new (require("discord.js").TextDisplayBuilder)()
                    .setContent(`# Blacklisted for Spamming
You have been blacklisted for spamming commands. Please refrain from such behavior
Floovi Antispam System | No one Can Bypass This!

**Support Server**: [Join our support server](https://dsc.gg/floovidev)`)
                );
              
              return message.channel.send({
                components: [container],
                flags: MessageFlags.IsComponentsV2
              });
            }
          }

          if (!timestamps.has(`${message.author.id}_cooldown_message_sent`)) {
            // Create a Components v2 response for cooldown
            const container = new (require("discord.js").ContainerBuilder)()
              .setAccentColor(parseInt(client.color.replace('#', ''), 16))
              .addTextDisplayComponents(
                new (require("discord.js").TextDisplayBuilder)()
                  .setContent(`# Cooldown\nPlease wait, this command is on cooldown for \`${timeLeft.toFixed(1)}s\``)
              );
            
            message.channel.send({
              components: [container],
              flags: MessageFlags.IsComponentsV2
            }).then((msg) => {
              setTimeout(() => msg.delete().catch(e => { }), 5000);
            });
            timestamps.set(`${message.author.id}_cooldown_message_sent`, true);
          }

          return;
        }
      }

      timestamps.set(message.author.id, now);
      timestamps.set(`${message.author.id}_count`, 1);
      setTimeout(() => {
        timestamps.delete(message.author.id);
        timestamps.delete(`${message.author.id}_count`);
        timestamps.delete(`${message.author.id}_cooldown_message_sent`);
      }, cooldownAmount);
    }

    if (
      command.userPermissions &&
      !message.member.permissions.has(
        PermissionsBitField.resolve(command.userPermissions)
      )
    ) {
      // Create a Components v2 response for missing user permissions
      const container = new (require("discord.js").ContainerBuilder)()
        .setAccentColor(parseInt(client.color.replace('#', ''), 16))
        .addTextDisplayComponents(
          new (require("discord.js").TextDisplayBuilder)()
            .setContent(`# Access Denied\nYou don't have enough Permissions to use this command!`)
        );
      
      return message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    }
    
    if (
      command.botPermissions &&
      !message.guild.members.me.permissions.has(
        PermissionsBitField.resolve(command.botPermissions)
      )
    ) {
      // Create a Components v2 response for missing bot permissions
      const container = new (require("discord.js").ContainerBuilder)()
        .setAccentColor(parseInt(client.color.replace('#', ''), 16))
        .addTextDisplayComponents(
          new (require("discord.js").TextDisplayBuilder)()
            .setContent(`# Missing Permissions\nI don't have enough Permissions to execute this command!`)
        );
      
      return message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    }
    
    if (command.inVc && !message.member.voice.channel) {
      // Create a Components v2 response for not in voice channel
      const container = new (require("discord.js").ContainerBuilder)()
        .setAccentColor(parseInt(client.color.replace('#', ''), 16))
        .addTextDisplayComponents(
          new (require("discord.js").TextDisplayBuilder)()
            .setContent(`# Voice Channel Required\nYou need to be in a voice channel to use this command!`)
        );
      
      return message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    }
    
    if (
      command.sameVc &&
      message.guild.members.me.voice.channel &&
      message.member.voice.channelId !==
        message.guild.members.me.voice.channel.id
    ) {
      // Create a Components v2 response for not in same voice channel
      const container = new (require("discord.js").ContainerBuilder)()
        .setAccentColor(parseInt(client.color.replace('#', ''), 16))
        .addTextDisplayComponents(
          new (require("discord.js").TextDisplayBuilder)()
            .setContent(`# Wrong Voice Channel\nI'm not in the same voice channel as you!`)
        );
      
      return message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    }

    if (command.voteOnly && client.config.vote) {
      let vote = await client.topgg.hasVoted(message.author.id);

      if (!vote) {
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("Vote To Unlock")
            .setStyle(ButtonStyle.Link)
            .setURL(`${client.config.topGg}/upvote`)
        );

        // Create a Components v2 response for vote requirement
        const container = new (require("discord.js").ContainerBuilder)()
          .setAccentColor(parseInt(client.color.replace('#', ''), 16))
          .addTextDisplayComponents(
            new (require("discord.js").TextDisplayBuilder)()
              .setContent(`# Vote Required
Hello!
Thank you for showing interest in using the ${command.name} command. This particular feature is part of the commands that are accessible after supporting our bot by voting on DBL.
By voting, you're helping us grow, reach more amazing users like you, and continue improving with new features, updates, and optimizations. Your support directly contributes to the stability and future development of the bot.
We truly appreciate every single vote as it motivates us to keep the bot running smoothly and deliver the best possible experience.
Please take a moment to cast your vote — it only takes a few seconds and means a lot to us.
Thank you once again for your support and understanding! 💖`)
          );
        
        return message.channel.send({ 
          components: [container],
          flags: MessageFlags.IsComponentsV2,
          components: [row] 
        });
      }
    }

    if (command.ownerOnly) {
      let owner = client.config.ownerIDS.includes(message.author.id);

      if (!owner) {
        // Create a Components v2 response for owner only commands
        const container = new (require("discord.js").ContainerBuilder)()
          .setAccentColor(parseInt(client.color.replace('#', ''), 16))
          .addTextDisplayComponents(
            new (require("discord.js").TextDisplayBuilder)()
              .setContent(`# Owner Only\nIt's an owner only command. You can't use this command!`)
          );
        
        return message.channel.send({
          components: [container],
          flags: MessageFlags.IsComponentsV2
        });
      }
    }

    const djData = await DjRoleSchema.findOne({ guildId: message.guild.id });

    if (command.dj && djData) {
      const role = message.guild.roles.cache.get(djData.roleId);
      const member = message.guild.members.cache.get(message.author.id);
      try {
        if (!role) {
          // Create a Components v2 response for missing DJ role
          const container = new (require("discord.js").ContainerBuilder)()
            .setAccentColor(parseInt(client.color.replace('#', ''), 16))
            .addTextDisplayComponents(
              new (require("discord.js").TextDisplayBuilder)()
                .setContent(`# DJ Role Not Found\nThe DJ role could not be found. It may have been deleted. Please check the server settings.`)
            );
          
          return message.channel.send({
            components: [container],
            flags: MessageFlags.IsComponentsV2
          });
        }

        if (!member.roles.cache.has(role.id)) {
          // Create a Components v2 response for missing DJ role permission
          const container = new (require("discord.js").ContainerBuilder)()
            .setAccentColor(parseInt(client.color.replace('#', ''), 16))
            .addTextDisplayComponents(
              new (require("discord.js").TextDisplayBuilder)()
                .setContent(`# DJ Role Required\nYou do not have the required DJ role to use this command.`)
            );
          
          return message.channel.send({
            components: [container],
            flags: MessageFlags.IsComponentsV2
          });
        }
      } catch (error) {
        console.error("Error fetching DJ role data:", error);
      }
    }

    const restrictionData = await RestrictionSchema.findOne({ guildId: message.guild.id });

    if (restrictionData) {
      if (restrictionData.restrictedTextChannels.includes(message.channel.id)) {
        // Create a Components v2 response for restricted text channel
        const container = new (require("discord.js").ContainerBuilder)()
          .setAccentColor(parseInt(client.color.replace('#', ''), 16))
          .addTextDisplayComponents(
            new (require("discord.js").TextDisplayBuilder)()
              .setContent(`# Channel Restricted\nThis text channel is restricted and you cannot use commands here!`)
          );
        
        const restrictedMessage = await message.reply({
          components: [container],
          flags: MessageFlags.IsComponentsV2
        });
        setTimeout(() => restrictedMessage.delete().catch(console.error), 10000);
        return;
      }

      if (message.member.voice.channelId && restrictionData.restrictedVoiceChannels.includes(message.member.voice.channelId)) {
        // Create a Components v2 response for restricted voice channel
        const container = new (require("discord.js").ContainerBuilder)()
          .setAccentColor(parseInt(client.color.replace('#', ''), 16))
          .addTextDisplayComponents(
            new (require("discord.js").TextDisplayBuilder)()
              .setContent(`# Voice Channel Restricted\nYou are in a restricted voice channel and cannot use commands!`)
          );
        
        const restrictedMessage = await message.reply({
          components: [container],
          flags: MessageFlags.IsComponentsV2
        });
        setTimeout(() => restrictedMessage.delete().catch(console.error), 10000);
        return;
      }
    }

    const isChannelIgnored = await IgnoreChannelSchema.findOne({
      guildId: message.guild.id,
      channelId: message.channel.id,
    });

    if (isChannelIgnored) {
      // Create a Components v2 response for ignored channel
      const container = new (require("discord.js").ContainerBuilder)()
        .setAccentColor(parseInt(client.color.replace('#', ''), 16))
        .addTextDisplayComponents(
          new (require("discord.js").TextDisplayBuilder)()
            .setContent(`# Channel Ignored\nThis Channel is in my Ignore List. You can't use my commands here!`)
        );
      
      const ignoredMessage = await message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
      setTimeout(() => ignoredMessage.delete().catch(console.error), 10000);
      return;
    }

    try {
      if (command.execute) {
        await command.execute(client, message, args);
      } else if (command.run) {
        await command.run(client, message, args, prefix, player);
      } else {
        throw new Error("Command handler not found.");
      }
    } catch (error) {
      console.error(error);
      // Create a Components v2 response for command errors
      const container = new (require("discord.js").ContainerBuilder)()
        .setAccentColor(parseInt(client.color.replace('#', ''), 16))
        .addTextDisplayComponents(
          new (require("discord.js").TextDisplayBuilder)()
            .setContent(`# Error\n❌ There was an error while executing the command.`)
        );
      
      message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const commandlogs = new WebhookClient({ url: `${client.config.cmd_log}` });
    commandlogs.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`Command Logs`)
          .setColor(client.color)
          .setAuthor({ name: `${client.user.username}`, iconURL: client.user.displayAvatarURL() })
          .addFields([
            {
              name: `Information`,
              value: `Command Author: ${message.author.tag}
Command Name: \`${command.name}\`
Channel Id: ${message.channel.id}
Channel Name: ${message.channel.name}
Guild Name: ${message.guild.name}
Guild Id: ${message.guild.id}`,
            },
          ])
          .setThumbnail(message.guild.iconURL({ dynamic: true })),
      ],
    });
  });
};