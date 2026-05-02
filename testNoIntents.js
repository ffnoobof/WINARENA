const { Client } = require('discord.js');
require('dotenv').config();

console.log('Testing login with no intents (will default to 0)...');
const client = new Client(); // No intents

client.once('ready', () => {
  console.log('Logged in as', client.user.tag);
  client.destroy();
});

client.once('error', (error) => {
  console.error('Error:', error);
});

client.login(process.env.TOKEN).catch(console.error);