const { 
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder
} = require("discord.js");
const mongoose = require("mongoose");

// Import our new UI components
const CommandResponse = require("../../components/ui/CommandResponse");

module.exports = {
  name: "ping",
  aliases: [],
  description: "Check bot and database latency",
  category: "Info",
  run: async (client, message, args) => {
    try {
      const msg = await message.channel.send("Pinging...");

      // Calculate Bot Latency
      const botLatency = msg.createdTimestamp - message.createdTimestamp;
      const apiLatency = Math.round(client.ws.ping);

      // Calculate DB Latency
      const dbStart = Date.now();
      await mongoose.connection.db.admin().ping();
      const dbLatency = Date.now() - dbStart;

      // Create a Components v2 response for ping information
      const container = new ContainerBuilder()
        .setAccentColor(0x2f3136)
        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`# Pong 🏓\n**Bot Latency:** \`${botLatency}ms\`\n**API Latency:** \`${apiLatency}ms\`\n**Database Latency:** \`${dbLatency}ms\``)
        );

      await msg.edit({ 
        content: "", 
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (err) {
      console.error(err);
      const response = CommandResponse.createErrorResponse(
        "Error",
        "An error occurred while checking the ping."
      );
      message.reply(response);
    }
  }
};