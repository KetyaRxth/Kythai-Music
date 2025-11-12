const updateQueue = require("../../handlers/setupQueue.js");
const CommandResponse = require("../../components/ui/CommandResponse");

module.exports = {
  name: "play",
  aliases: ["p"],
  description: "Play a song or playlist",
  category: "Music",
  inVc: true,
  sameVc: true,
  dj: true,
  premium: false,

  run: async (client, message, args, prefix) => {
    const channel = message.member.voice.channel;
    const query = args.join(" ");

    if (!args[0]) {
      const response = CommandResponse.createErrorResponse(
        "Missing Query",
        "Please provide a song name, URL or playlist."
      );
      return message.reply(response);
    }

    const player = await client.manager.createPlayer({
      guildId: message.guild.id,
      textId: message.channel.id,
      voiceId: channel.id,
      volume: 80,
      deaf: true,
      shardId: message.guild.shardId,
    });

    const result = await client.manager.search(query, {
      requester: message.author,
    });

    if (!result.tracks.length) {
      const response = CommandResponse.createErrorResponse(
        "No Results",
        `No results found for **${query}**.`
      );
      return message.reply(response);
    }

    if (result.type === "PLAYLIST") {
      result.tracks.forEach((track) => player.queue.add(track));
      if (!player.playing && !player.paused) player.play();

      const response = CommandResponse.createSuccessResponse(
        "Playlist Queued",
        `Added **${result.tracks.length}** songs from [${result.playlistName}](${query})`
      );
      
      await updateQueue(message.guild, player.queue);
      return message.reply(response);
    }

    const track = result.tracks[0];
    player.queue.add(track);
    if (!player.playing && !player.paused) player.play();

    // Show simple "queue started" message instead of full player interface
    const response = CommandResponse.createSuccessResponse(
      "Queue Started",
      `**${track.title}** has been added to the queue and will start playing!`
    );
    
    await message.reply(response);

    await updateQueue(message.guild, player.queue);
  },
};