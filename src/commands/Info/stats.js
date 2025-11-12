const os = require("os");
const StatsUI = require("../../components/ui/StatsUI");

module.exports = {
  name: "stats",
  aliases: ["botinfo", "st", "bi"],
  description: "Show bot and shard stats",
  category: "Info",
  run: async (client, message, args) => {
    try {
      const formatDuration = (ms) => {
        let sec = Math.floor(ms / 1000);
        let min = Math.floor(sec / 60);
        let hrs = Math.floor(min / 60);
        let days = Math.floor(hrs / 24);

        sec %= 60;
        min %= 60;
        hrs %= 24;

        return `${days}d ${hrs}h ${min}m ${sec}s`;
      };

      const uptime = formatDuration(client.uptime);
      const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
      const cpuLoad = os.loadavg()[0].toFixed(2);
      const fakeUsers = 2733476;
      const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0) + fakeUsers;
      const totalChannels = client.channels.cache.size;

      // Get Discord.js version
      const djsVersion = require('discord.js/package.json')?.version || 'Unknown';
      const nodeVersion = process.version;

      const stats = {
        servers: client.guilds.cache.size,
        users: totalUsers,
        channels: totalChannels,
        uptime: uptime,
        memory: memoryUsage,
        cpu: cpuLoad,
        nodeVersion: nodeVersion,
        djsVersion: djsVersion,
        shardId: message.guild.shardId,
        totalShards: client.ws.shards.size,
        ping: Math.round(client.ws.ping),
        developer: '[! ANsh .](https://discord.com/users/1383706658315960330)'
      };

      const response = StatsUI.createStatsInterface(client, stats);
      await message.channel.send(response);
    } catch (err) {
      console.error(err);
      message.reply("An error occurred while fetching bot stats.");
    }
  },
};