const CommandResponse = require("../../components/ui/CommandResponse");

module.exports = {
  name: "stop",
  description: `Stops the player and clears the queue.`,
  category: "Music",
  cooldown: 5,
  inVc: true,
  sameVc: true,
  dj: true,

  run: async (client, message, args, prefix, player) => {
    if (!player) {
      const response = CommandResponse.createErrorResponse(
        "No Player Found",
        "No active player found in this server."
      );
      return message.channel.send(response);
    }

    // 🧹 Cleanup
    player.setLoop("none");
    player.data.set("autoplay", false);
    player.queue.clear();

    // 🧼 Delete Now Playing message
    const nowPlayingMessage = player.data.get("nplaying");
    if (nowPlayingMessage) {
      const channel = client.channels.cache.get(nowPlayingMessage.channelId);
      if (channel) {
        const msg = await channel.messages.fetch(nowPlayingMessage.id).catch(() => null);
        if (msg && msg.deletable) {
          await msg.delete().catch(() => {});
        }
      }
      player.data.delete("nplaying");
    }

    // 🔁 Skip or Destroy
    if (player.queue.size === 0) {
      player.destroy();
    } else {
      player.stop();
    }

    // ✅ Send response
    const response = CommandResponse.createSuccessResponse(
      "Music Stopped",
      "Music playback has been **stopped** and the queue has been **cleared**.\n\nThank you for using TitanXMusic! Feel free to queue more tracks anytime."
    );

    return message.channel.send(response);
  }
};