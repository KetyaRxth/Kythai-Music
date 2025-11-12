const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const NoPrefixSchema = require("../../models/NoPrefixSchema.js");
const moment = require("moment"); // For formatting dates

// 👇 Support Server Guild ID
const BADGE_GUILD_ID = "1420573291319529483"; // Replace with your actual Guild ID

const badgeMap = {
  "1408368580851929101": { emoji: "<:dev:1425855704803053738>", label: "! ANSH ‹/›" },
  "1408368580851929101": { emoji: "<:dev:1425855704803053738>", label: "Developer" },
  "1408360145460924498": { emoji: "<:owner:1425855832003710997>", label: "Owner" },
  "1408360165014765649": { emoji: "<:nc_owner:1425855951965261906>", label: "Co Owner" },
  "1418333819752157294": { emoji: "<:head_admin:1425856033053737011>", label: "Head Executive" },
  "1418333819009892363": { emoji: "<:head_admin:1425856033053737011>", label: "Senior Executive" },
  "1418333818305384591": { emoji: "<:head_admin:1425856033053737011>", label: "Executive" },
  "1418331807492866129": { emoji: "<:Head_Manager:1425856491776114801>", label: "Head Manager" },
  "1418328917298778204": { emoji: "<:Head_Manager:1425856491776114801>", label: "Senior Manager" },
  "1408361045352906793": { emoji: "<:Head_Manager:1425856491776114801>", label: "Manager" },
  "1418328907219730622": { emoji: "<:head_admin:1418455419382399047>", label: "Head Admin" },
  "1418328908146933850": { emoji: "<:Red:1425856310284386396>", label: "Senior Admin" },
  "1408360165786386552": { emoji: "<:Red:1425856310284386396>", label: "Admin" },
  "1418333119735402617": { emoji: "<a:supporter:1425855438829916240>", label: "Reviewer" },
  "1418328915914653726": { emoji: "<a:supporter:1425855438829916240>", label: "Head Moderator" },
  "1418328916602519592": { emoji: "<a:supporter:1425855438829916240>", label: "Senior Moderator" },
  "1408360622315278426": { emoji: "<a:supporter:1425855438829916240>", label: "Moderator" },
  "1408360622940225689": { emoji: "<a:team:1425844993809190985>", label: "Trial Moderator" },
  "1418332431538192495": { emoji: "<a:team:1425844993809190985>", label: "Junior Staff" },
  "1418332432461205584": { emoji: "<a:team:1425844993809190985>", label: "Senior Staff" },
  "1408360623439478855": { emoji: "<a:team:1425844993809190985>", label: "Staff" },
  "1408361435809058846": { emoji: "<:titan_ferramenta:1425847690734080093>", label: "Big Server Owner" },
  "1408360627927384094": { emoji: "<:titan_ferramenta:1425847690734080093>", label: "Developer's Friend" },
  "1383073624902209607": { emoji: "<:titan_ferramenta:1425847690734080093>", label: "Server Partner" },
  "1388178874667503877": { emoji: "🐛", label: "Bug Hunter" },
  "1408361031201198090": { emoji: "<:supporter:1420948929469747202>", label: "Supporter" },
  "1408361311167057990": { emoji: "<a:titan_requester:1425843340636848189>", label: "Music Listener" },
};

module.exports = {
  name: "profile",
  aliases: ["badges","pr"],
  description: "Displays a user's profile with global badges and no-prefix status",
  category: "Info",
  cooldown: 5,

  run: async (client, message, args) => {
    const targetUser = message.mentions.users.first() || message.author;

    // Fetch badge guild and member
    const badgeGuild = client.guilds.cache.get(BADGE_GUILD_ID);
    if (!badgeGuild) {
      return message.reply({
        content: "❌ The support server could not be found. Please contact the bot owner."
      });
    }

    let member;
    try {
      member = await badgeGuild.members.fetch(targetUser.id);
    } catch {
      member = null;
    }

    // Check badges
    let userBadges = [];
    let allBadges = "🌟 You don't have any badges yet! Join our support server to earn some!";

    if (member) {
      const badgeOrder = Object.keys(badgeMap);
      userBadges = badgeOrder
        .filter(roleId => member.roles.cache.has(roleId))
        .map(roleId => `${badgeMap[roleId].emoji} **${badgeMap[roleId].label}**`);

      if (userBadges.length > 0) {
        allBadges = userBadges.join("\n");
      }
    }

    // Check no-prefix status
    let noPrefixStatus = "No active no-prefix status.";
    try {
      const noPrefixData = await NoPrefixSchema.findOne({ userId: targetUser.id });
      if (noPrefixData) {
        if (noPrefixData.isPermanent) {
          noPrefixStatus = "**Permanent No-Prefix**";
        } else if (noPrefixData.expirationDate) {
          const expiration = moment(noPrefixData.expirationDate).format("MMMM Do YYYY, h:mm A");
          const daysLeft = moment(noPrefixData.expirationDate).diff(moment(), "days");
          noPrefixStatus = `**No-Prefix Active** (Expires: ${expiration}, ${daysLeft} days left)`;
        }
      }
    } catch (error) {
      console.error("Error fetching no-prefix data:", error);
      noPrefixStatus = "⚠️ Error fetching no-prefix status.";
    }

    // Create enhanced embed
    const embed = new EmbedBuilder()
      .setColor(client.color || "#00FF7F") // Fallback to a cool neon green
      .setAuthor({
        name: `${targetUser.username}'s Profile`,
        iconURL: targetUser.displayAvatarURL({ dynamic: true, size: 256 })
      })
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 512 }))
      .setDescription(
        `**User**: ${targetUser.tag}\n` +
        `**ID**: \`${targetUser.id}\`\n` +
        `**Account Created**: ${moment(targetUser.createdAt).format("MMMM Do YYYY")}`
      )
      .addFields(
        {
          name: `<a:badges:1341064734572548147> Badges [${userBadges.length}]`,
          value: allBadges,
          inline: true
        },
        {
          name: "No-Prefix Status",
          value: noPrefixStatus,
          inline: true
        }
      )
      .setImage("https://cdn.discordapp.com/attachments/1371496371147902986/1298378273644544041/profile_banner.png") // Replace with your custom banner URL
      .setFooter({
        text: `Requested by ${message.author.username} | Powered by ${client.user.username}`,
        iconURL: client.user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    // Create action row with buttons
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Join Support Server")
        .setStyle(ButtonStyle.Link)
        .setEmoji("<a:supporter:1341062737727459411>")
        .setURL("https://discord.gg/RPuK3n8YBT"),
      new ButtonBuilder()
        .setLabel("Vote for Us")
        .setStyle(ButtonStyle.Link)
        .setEmoji("<:discord:1395682373768581215>")
        .setURL("https://discord.gg/RPuK3n8YBT")
    );

    return message.reply({ embeds: [embed], components: [row] });
  },
};