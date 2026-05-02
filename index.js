require('dotenv').config();
console.log('Environment variables loaded:');
console.log(' - TOKEN:', process.env.TOKEN ? `'${process.env.TOKEN}'` : 'not set');
console.log(' - DISCORD_TOKEN:', process.env.DISCORD_TOKEN ? `'${process.env.DISCORD_TOKEN}'` : 'not set');
console.log(' - MONGO_URI:', process.env.MONGO_URI ? `'${process.env.MONGO_URI}'` : 'not set');
console.log(' - DISCORD_CLIENT_ID:', process.env.DISCORD_CLIENT_ID ? `'${process.env.DISCORD_CLIENT_ID}'` : 'not set');
console.log(' - CLIENT_ID:', process.env.CLIENT_ID ? `'${process.env.CLIENT_ID}'` : 'not set');

const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Events, Collection } = require('discord.js');
const { connectDatabase, ensureDbReady } = require('./db');
const TeamManager = require('./teamManager');

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

const discordTokenRaw = process.env.DISCORD_TOKEN || process.env.TOKEN;
const discordToken = discordTokenRaw ? discordTokenRaw.trim() : null;
const mongoUriRaw = process.env.MONGO_URI;
const mongoUri = mongoUriRaw ? mongoUriRaw.trim() : null;
const clientIdRaw = process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID;
const clientId = clientIdRaw ? clientIdRaw.trim() : null;

console.log('Processed values:');
console.log(' - discordToken:', discordToken ? `'${discordToken}'` : 'null');
console.log(' - mongoUri:', mongoUri ? `'${mongoUri}'` : 'null');
console.log(' - clientId:', clientId ? `'${clientId}'` : 'null');

async function loadCommands(client) {
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if (!command.data || !command.execute) {
      console.warn(`Skipping invalid command file: ${file}`);
      continue;
    }

    client.commands.set(command.data.name, command);
  }
}

function validateEnvironment() {
  if (!discordToken || !mongoUri || !clientId) {
    console.error('Missing required environment variables. Ensure DISCORD_TOKEN (or TOKEN), MONGO_URI, and DISCORD_CLIENT_ID (or CLIENT_ID) are set.');
    process.exit(1);
  }

  if (!mongoUri.startsWith('mongodb+srv://')) {
    console.error('MONGO_URI must be a valid Atlas connection string starting with mongodb+srv://');
    process.exit(1);
  }
}

async function start() {
  console.log('Starting bot...');

  validateEnvironment();

  // Debug: log token info (be careful with sensitive data)
  if (discordToken) {
    console.log(`Token length: ${discordToken.length}`);
    console.log(`Token starts with: ${discordToken.substring(0, 3)}`);
    console.log(`Token ends with: ${discordToken.substring(discordToken.length - 3)}`);
    // Check if token looks like a bot token (should have 2 dots)
    const parts = discordToken.split('.');
    console.log(`Token has ${parts.length} parts: ${parts.map(p => p.length)}`);
  }

  console.log('Connecting to MongoDB...');
  await connectDatabase(mongoUri);
  ensureDbReady();

  const teamManager = new TeamManager();
  await teamManager.init();

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  });

  client.commands = new Collection();

  console.log('Loading commands...');
  await loadCommands(client);

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, teamManager);
    } catch (error) {
      console.error(`Command execution error for ${interaction.commandName}:`, error);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: 'An error occurred while running this command.' });
      } else {
        await interaction.reply({ content: 'An error occurred while running this command.', ephemeral: true });
      }
    }
  });

  client.once(Events.ClientReady, () => {
    console.log('✅ Bot ready');
  });

  console.log('Logging into Discord...');
  await client.login(discordToken);
}

start().catch((error) => {
  console.error('Startup failure:', error);
  process.exit(1);
});
