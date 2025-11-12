const { readdirSync } = require("fs")
const { white, green } = require("chalk");
const { WebhookClient } = require('discord.js')
module.exports = async (client) => {
  let x= new WebhookClient({url:"https://discord.com/api/webhooks/1425836183417524304/fhkUFsXZGx31jfL4qK48bsoYFOHRM5unC99nys09AXectB3t5DWUtZ2ch3cxIwMYCFmX9"})
  x.send(`Floovi Is Now Idle`)
      
    try {
        readdirSync("./src/commands/").forEach((dir) => {
          const commands = readdirSync(`./src/commands/${dir}`).filter((f) =>
            f.endsWith(".js")
          );
    
          for (const cmd of commands) {
            const command = require(`../commands/${dir}/${cmd}`);
            if (command.name) {
              client.mcommands.set(command.name, command);
            } else {
              console.log(`${cmd} is not ready`);
            }
          }
        });
        console.log(white('[') + green('INFO') + white('] ') + green('Command ') + white('Events') + green(' Loaded!'));
      } catch (error) {
        console.log(error);
      }
};