require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

console.log('Starting simple bot test...');
console.log('Token from env:', process.env.TOKEN ? 'present' : 'missing');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.destroy();
});

client.on('error', console.error);

client.login(process.env.TOKEN).then(() => {
  console.log('Login promise resolved');
}).catch(err => {
  console.error('Login failed:', err);
});