const { EmbedBuilder } = require("discord.js");
const schema = require("../../models/PremiumGuildSchema.js");
const ms = require("ms");

// ✅ Authorized Owner IDs
const authorizedOwners = ["1383706658315960330", "1322838042897289267"];

module.exports = {
  name: "premiumadd",
  aliases: ["addprem", "addpremium", "++"],
  description: "Add Premium Guild (Owner Only)",
  category: "Owner",
  ownerOnly: true,

  run: async (client, message, args, prefix) => {
    if (!authorizedOwners.includes(message.author.id)) return;

    const guildId = args[0];
    const durationArg = args[1];

    if (!guildId) {
      return message.reply("<:titan_Warning:1425844290025947270> Please specify a guild ID!");
    }

    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      return message.reply("<:titan_crossmark:1425843965185359904> Invalid guild ID!");
    }

    try {
      // 🔄 Delete old premium record
      const oldData = await schema.findOne({ Guild: guildId });

      // ⏳ Duration logic
      let expireTime = 0;
      let isPermanent = true;
      let expireText = "Never";

      if (durationArg) {
        const duration = ms(durationArg);
        if (!duration) {
          return message.reply("<:titan_crossmark:1425843965185359904> Invalid time format! Use `30d`, `1y`, `12h`, etc.");
        }
        expireTime = Date.now() + duration;
        isPermanent = false;
        expireText = `<t:${Math.floor(expireTime / 1000)}:R>`;
      }

      // 💾 Save to DB
      await new schema({
        Guild: guildId,
        Expire: expireTime,
        Permanent: isPermanent,
      }).save();

      // 🤖 Fetch bot member in guild
      const me = await guild.members.fetch(client.user.id).catch(() => null);

      if (me) {
        console.log(`🔍 Bot info in guild: ${guild.name}`);
        console.log("➤ Bot permissions:", me.permissions.toArray());
        console.log("➤ Bot role position:", me.roles.highest.position);
        console.log("➤ Is manageable:", me.manageable);
      }

      // 📝 Try setting nickname
      if (me && me.manageable) {
        await me.setNickname("Floovi Pro").then(() => {
          console.log(`✅ Nickname changed to "Floovi Pro" in ${guild.name}`);
        }).catch((err) => {
          console.error("❌ Nickname change failed:", err);
        });
      } else {
        console.log(`⚠️ Cannot change nickname in ${guild.name}.`);
        message.reply("Bot is not manageable. Make sure bot role is at the top and has Manage Nicknames permission.");
      }

      // 📢 Send embed confirmation
      const embed = new EmbedBuilder()
        .setTitle("Premium Activated!")
        .setColor("#2F3136")
        .setThumbnail(guild.iconURL({ dynamic: true, size: 4096 }))
        .setDescription(`<:titan_tick:1425843673534562334> Premium successfully activated for **${guild.name}**`)
        .addFields(
          { name: "Guild ID", value: guild.id, inline: true },
          { name: "Members", value: `${guild.memberCount}`, inline: true },
          { name: "Plan", value: isPermanent ? "Permanent" : durationArg, inline: true },
          { name: "Expires", value: expireText, inline: true }
        )
        .setFooter({
          text: `Assigned by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL(),
        });

      message.reply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      message.reply("<:titan_crossmark:1425843965185359904> An error occurred while saving the data.");
    }
  },
};