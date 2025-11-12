const { EmbedBuilder } = require("discord.js");
const { nodes } = require("../../config/config.js");

module.exports = {
    name: "lavalink",
    aliases: ["node", "lstatus"],
    description: "Displays the status of the Lavalink node.",
    category: "Owner",
    ownerOnly: true, 
    run: async (client, message, args) => {
        const node = client.manager.nodes.get(nodes[0].name);

        if (!node || !node.connected) {
            const embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription("Lavalink node is not connected.");
            return message.channel.send({ embeds: [embed] });
        }

        const stats = node.stats;

        const formatUptime = (uptime) => {
            const seconds = Math.floor((uptime / 1000) % 60);
            const minutes = Math.floor((uptime / (1000 * 60)) % 60);
            const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
            const days = Math.floor(uptime / (1000 * 60 * 60 * 24));

            return `${days}d ${hours}h ${minutes}m ${seconds}s`;
        };

        const formatMemory = (bytes) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setTitle("LAVALINK STATUS")
            .setDescription(
                `**Node ${nodes[0].name} Connected**\n` +
                `Player: ${stats.players}\n` +
                `Playing Players: ${stats.playingPlayers}\n` +
                `Uptime: ${formatUptime(stats.uptime)}\n\n` +
                `**Memory**\n` +
                `Reservable Memory: ${formatMemory(stats.memory.reservable)}\n` +
                `Used Memory: ${formatMemory(stats.memory.used)}\n` +
                `Free Memory: ${formatMemory(stats.memory.free)}\n` +
                `Allocated Memory: ${formatMemory(stats.memory.allocated)}\n\n` +
                `**CPU**\n` +
                `Cores: ${stats.cpu.cores}\n` +
                `System Load: ${(stats.cpu.systemLoad * 100).toFixed(2)}%\n` +
                `Lavalink Load: ${(stats.cpu.lavalinkLoad * 100).toFixed(2)}%`
            );

        return message.channel.send({ embeds: [embed] });
    }
};