const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// Get token from env
const token = process.env.TOKEN;
console.log('Testing token:', token ? token.substring(0, 10) + '...' : 'undefined');

if (!token) {
  console.error('No token found in environment variables');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log('Logged in as', client.user.tag);
  client.destroy();
});

client.once('error', (error) => {
  console.error('Client error:', error);
});

client.once('shardDisconnect', (event) => {
  console.log('Shard disconnected:', event);
});

client.login(token).catch(console.error);