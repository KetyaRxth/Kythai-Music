const { 
  EmbedBuilder,
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder
} = require("discord.js");

// Import our new UI components
const CommandResponse = require("../components/ui/CommandResponse");

module.exports = async (client) => {
  const cleanNowPlaying = async (player) => {
    try {
      const nowPlayingMessage = player.data.get("nplaying");
      if (nowPlayingMessage) {
        const channel = client.channels.cache.get(nowPlayingMessage.channelId);
        if (!channel) return;

        const message = await channel.messages.fetch(nowPlayingMessage.id).catch(() => null);
        if (message && message.deletable) {
          await message.delete().catch(() => {});
        }

        player.data.delete("nplaying");
      }
    } catch (_) {}
  };

  client.manager.on("playerEnd", cleanNowPlaying);
  client.manager.on("playerDestroy", cleanNowPlaying);
};