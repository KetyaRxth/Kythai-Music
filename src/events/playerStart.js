const { 
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");
const setplayer = require("../models/SetupPlayerSchema.js");
const setup = require("../models/SetupSchema.js");
const updateMessage = require("../handlers/setupQueue.js");

// Import our new UI components
const MusicPlayer = require("../components/ui/MusicPlayer");
const CommandResponse = require("../components/ui/CommandResponse");

module.exports = async (client) => {
    client.manager.on("playerStart", async (player, track) => {
        try {
            const playerConfig = await setplayer.findOne({ guildId: player.guildId });
            const mode = playerConfig?.playerMode || 'classic';
            const updateData = await setup.findOne({ guildId: player.guildId });

            await updateMessage(player, client, track);

            if (updateData && updateData.channelId == player.textId) return;

            player.previousTrack = player.currentTrack || null;
            player.currentTrack = track;

            if (mode === "classic") {
                const messageChannel = client.channels.cache.get(player.textId);
                if (!messageChannel) return;
                
                // Ensure we're sending to a text-based channel (not voice channel)
                if (!messageChannel.isTextBased()) {
                    console.warn(`Cannot send player message to channel ${player.textId}: not a text channel`);
                    return;
                }

                // Create a Components v2 response for the player interface with canvas
                const playerResponse = await MusicPlayer.createPlayerInterface(
                    track,
                    player.queue,
                    {
                        paused: player.paused,
                        volume: player.volume,
                        position: "0:00", // Will be updated by the player
                        repeatMode: player.loop,
                        shuffle: false // Will be updated by the player
                    },
                    client
                );

                const nplaying = await messageChannel.send(playerResponse).catch(console.error);
                if (!nplaying) return;

                player.data.set("nplaying", nplaying);

                const filter = (i) =>
                    i.guild.members.me.voice.channel &&
                    i.guild.members.me.voice.channelId === i.member.voice.channelId;
                const collector = nplaying.createMessageComponentCollector({ filter, time: 3600000 });

                collector.on("collect", async (interaction) => {
                    const id = interaction.customId;
                    let feedbackMessage;
                    let feedbackType = "info";
                    await interaction.deferUpdate();

                    switch (id) {
                        case "pause":
                            await player.pause(!player.paused);
                            feedbackMessage = `The track has been successfully ${player.paused ? "paused" : "resumed"}.`;
                            feedbackType = "success";
                            break;
                        case "skip":
                            if (player.queue.size > 0) {
                                await player.skip();
                                feedbackMessage = `Skipped to the next track in the queue.`;
                                feedbackType = "success";
                            } else {
                                await player.destroy();
                                feedbackMessage = `No more tracks in queue. Stopping playback.`;
                                feedbackType = "warning";
                            }
                            break;
                        case "back":
                            const previous = player.previousTrack;
                            if (previous) {
                                await player.play(previous);
                                feedbackMessage = `Playing previous track.`;
                                feedbackType = "success";
                            } else {
                                feedbackMessage = `No previous track available.`;
                                feedbackType = "warning";
                            }
                            break;
                        case "shuffle":
                            player.queue.shuffle();
                            feedbackMessage = `Queue has been shuffled.`;
                            feedbackType = "success";
                            break;
                        case "loop":
                            const newLoop = player.loop === "track" ? "none" : "track";
                            await player.setLoop(newLoop);
                            feedbackMessage = `Loop mode has been ${newLoop === "track" ? "enabled" : "disabled"}.`;
                            feedbackType = "success";
                            break;
                    }

                    if (feedbackMessage) {
                        let feedbackResponse;
                        switch (feedbackType) {
                            case "success":
                                feedbackResponse = CommandResponse.createSuccessResponse("Action Completed", feedbackMessage);
                                break;
                            case "warning":
                                feedbackResponse = CommandResponse.createWarningResponse("Notice", feedbackMessage);
                                break;
                            default:
                                feedbackResponse = CommandResponse.createInfoResponse("Information", feedbackMessage);
                        }
                        
                        const feedback = await interaction.channel.send(feedbackResponse);
                        setTimeout(() => feedback.delete().catch(() => { }), 5000);
                    }

                    // Update the player interface with current state
                    const updatedPlayerResponse = await MusicPlayer.createPlayerInterface(
                        player.currentTrack,
                        player.queue,
                        {
                            paused: player.paused,
                            volume: player.volume,
                            position: "0:00", // Will be updated by the player
                            repeatMode: player.loop,
                            shuffle: false // Will be updated by the player
                        },
                        client
                    );
                    
                    await nplaying.edit(updatedPlayerResponse).catch(() => { });
                });

                collector.on("end", async (_, reason) => {
                    if (reason === "time") {
                        // Update the player interface with current state
                        const updatedPlayerResponse = await MusicPlayer.createPlayerInterface(
                            player.currentTrack,
                            player.queue,
                            {
                                paused: player.paused,
                                volume: player.volume,
                                position: "0:00",
                                repeatMode: player.loop,
                                shuffle: false
                            },
                            client
                        );
                        
                        await nplaying.edit(updatedPlayerResponse).catch(() => { });
                    }
                });
            }
        } catch (e) {
            console.error("playerStart error:", e);
        }
    });
};
