const ServerInfoUI = require("../../components/ui/ServerInfoUI");

module.exports = {
  name: "serverinfo",
  aliases: ["si", "guildinfo"],
  description: "Get information about the server",
  category: "Info",
  premium: false,

  run: async (client, message, args, prefix) => {
    try {
      const guild = message.guild;
      const owner = await guild.fetchOwner();

      const serverData = {
        owner: owner.user.tag,
        created: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
        members: guild.memberCount.toLocaleString(),
        bots: guild.members.cache.filter(m => m.user.bot).size.toLocaleString(),
        humans: guild.members.cache.filter(m => !m.user.bot).size.toLocaleString(),
        channels: guild.channels.cache.size.toLocaleString(),
        textChannels: guild.channels.cache.filter(c => c.type === 0).size.toLocaleString(),
        voiceChannels: guild.channels.cache.filter(c => c.type === 2).size.toLocaleString(),
        roles: guild.roles.cache.size.toLocaleString(),
        emojis: guild.emojis.cache.size.toLocaleString(),
        boostLevel: guild.premiumTier || '0'
      };

      const response = ServerInfoUI.createServerInfoInterface(client, guild, serverData);
      return message.reply(response);
    } catch (error) {
      console.error(error);
      const CommandResponse = require("../../components/ui/CommandResponse");
      const response = CommandResponse.createErrorResponse(
        "Error",
        "An error occurred while fetching server information."
      );
      return message.reply(response);
    }
  }
};

