const UserInfoUI = require("../../components/ui/UserInfoUI");

module.exports = {
  name: "userinfo",
  aliases: ["ui", "whois"],
  description: "Get information about a user",
  category: "Info",
  premium: false,

  run: async (client, message, args, prefix) => {
    try {
      const user = message.mentions.users.first() || message.author;
      const member = message.guild.members.cache.get(user.id);

      const userData = {
        globalName: user.globalName || null,
        created: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
        joined: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : "Not in server",
        rolesCount: member && member.roles.cache.size > 1 ? (member.roles.cache.size - 1).toString() : "0",
        highestRole: member && member.roles.highest.id !== message.guild.id ? member.roles.highest.toString() : null,
        roles: member && member.roles.cache.size > 1 
          ? member.roles.cache
              .filter(r => r.id !== message.guild.id)
              .map(r => r.toString())
              .slice(0, 20)
              .join(", ")
              .slice(0, 1000) || "None"
          : "None",
        permissions: member 
          ? member.permissions.toArray().slice(0, 10).join(", ") || "None"
          : "None"
      };

      const response = UserInfoUI.createUserInfoInterface(client, user, member, userData);
      return message.reply(response);
    } catch (error) {
      console.error(error);
      const CommandResponse = require("../../components/ui/CommandResponse");
      const response = CommandResponse.createErrorResponse(
        "Error",
        "An error occurred while fetching user information."
      );
      return message.reply(response);
    }
  }
};

