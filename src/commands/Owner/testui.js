const { MessageFlags } = require("discord.js");

// Import our new UI components
const CommandResponse = require("../../components/ui/CommandResponse");
const ConfigUI = require("../../components/ui/ConfigUI");
const MusicPlayer = require("../../components/ui/MusicPlayer");
const HelpUI = require("../../components/ui/HelpUI");

module.exports = {
  name: "testui",
  aliases: ["tui"],
  description: "Test the new Components v2 UI system",
  category: "Owner",
  ownerOnly: true,

  run: async (client, message, args) => {
    const subcommand = args[0] || "help";
    
    switch (subcommand) {
      case "success":
        const successResponse = CommandResponse.createSuccessResponse(
          "Success Test",
          "This is a success message using the new Components v2 UI system!",
          "Additional details about the success can be shown here."
        );
        return message.reply(successResponse);
        
      case "error":
        const errorResponse = CommandResponse.createErrorResponse(
          "Error Test",
          "This is an error message using the new Components v2 UI system!",
          "Error details and troubleshooting information can be shown here."
        );
        return message.reply(errorResponse);
        
      case "config":
        const configResponse = ConfigUI.create247ConfigInterface(
          message.guild.id,
          false,
          message.member.voice.channel,
          message.channel
        );
        return message.reply(configResponse);
        
      case "player":
        const track = {
          title: "Test Song",
          author: "Test Artist",
          duration: "3:45",
          requester: { username: message.author.username },
          thumbnail: client.user.displayAvatarURL()
        };
        
        const queue = [
          { title: "Next Song 1", author: "Artist 1" },
          { title: "Next Song 2", author: "Artist 2" }
        ];
        
        const playerState = {
          paused: false,
          volume: 80,
          position: "1:30",
          repeatMode: "off",
          shuffle: false
        };
        
        const playerResponse = MusicPlayer.createPlayerInterface(track, queue, playerState);
        return message.reply(playerResponse);
        
      case "help":
      default:
        const commandsByCategory = {
          'Music': [
            { name: 'play', description: 'Play a song' },
            { name: 'skip', description: 'Skip the current song' }
          ],
          'Config': [
            { name: 'prefix', description: 'Set the bot prefix' }
          ]
        };
        
        const helpResponse = HelpUI.createMainHelpInterface(commandsByCategory, "?");
        return message.reply(helpResponse);
    }
  }
};