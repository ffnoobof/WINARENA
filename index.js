require('dotenv').config();
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

const discordToken = process.env.DISCORD_TOKEN;
const mongoUri = process.env.MONGO_URI;
const clientId = process.env.CLIENT_ID;

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
    console.error('Missing required environment variables. Ensure DISCORD_TOKEN, CLIENT_ID, and MONGO_URI are set.');
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
