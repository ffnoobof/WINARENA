const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '.env');
const buffer = fs.readFileSync(envPath);
const content = buffer.toString('utf8');

// Extract token line
const lines = content.split('\n');
let tokenLine = '';
for (const line of lines) {
  if (line.trim().startsWith('TOKEN=')) {
    tokenLine = line.trim();
    break;
  }
}

if (!tokenLine) {
  console.error('No TOKEN line found in .env');
  process.exit(1);
}

console.log('TOKEN line:', tokenLine);

// Extract token value
const token = tokenLine.substring('TOKEN='.length);
console.log('Extracted token:', token);
console.log('Token length:', token.length);

// Check each character
console.log('\nCharacter analysis:');
for (let i = 0; i < token.length; i++) {
  const char = token[i];
  const code = token.charCodeAt(i);
  // Print non-standard characters
  if (code > 126 || (code < 32 && ![9, 10, 13].includes(code))) {
    console.log(`  Position ${i}: '${char}' (code ${code})`);
  }
}

// Check if there are any characters that look normal but aren't ASCII
console.log('\nChecking for look-alike characters:');
const suspicious = [
  { expected: '.', actual: '\uFF0E' }, // Fullwidth full stop
  { expected: '.', actual: '\u22C5' }, // Dot operator
  { expected: '.', actual: '\u2024' }, // One dot leader
];
for (const {expected, actual} of suspicious) {
  if (token.includes(actual)) {
    console.log(`  Found suspicious character: expected '${expected}' (${expected.charCodeAt(0)}) but found '${actual}' (${actual.charCodeAt(0)})`);
  }
}

// Try to recreate the token exactly as it should be
console.log('\nRebuilding token from parts:');
const parts = token.split('.');
console.log(`Parts: ${parts.length}`);
console.log(`Part 0: '${parts[0]}' (length ${parts[0].length})`);
console.log(`Part 1: '${parts[1]}' (length ${parts[1].length})`);
console.log(`Part 2: '${parts[2]}' (length ${parts[2].length})`);

const rebuilt = parts.join('.');
console.log(`Rebuilt token: ${rebuilt}`);
console.log(`Tokens match: ${token === rebuilt}`);

// Try logging in with the rebuilt token
console.log('\nTesting login with rebuilt token...');
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log('SUCCESS: Logged in as', client.user.tag);
  client.destroy();
});

client.once('error', (error) => {
  console.error('ERROR: Client error:', error);
});

client.login(rebuilt).catch(error => {
  console.error('ERROR: Login failed:', error);
});