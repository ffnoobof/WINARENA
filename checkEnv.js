const fs = require('fs');
const path = require('path');

// Read .env file as raw buffer to check for BOM or special characters
const envPath = path.join(__dirname, '.env');
const buffer = fs.readFileSync(envPath);
console.log('.env file size:', buffer.length, 'bytes');
console.log('.env file hex (first 50 bytes):', buffer.slice(0, 50).toString('hex'));

// Check for BOM (EF BB BF)
if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
  console.log('WARNING: .env file contains UTF-8 BOM');
}

// Read as text
const content = buffer.toString('utf8');
console.log('.env content:');
console.log(content.replace(/^/gm, '  ')); // Indent for readability

// Parse manually
const lines = content.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
console.log('\nParsed lines:');
lines.forEach((line, index) => {
  console.log(`${index + 1}: ${line}`);
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('='); // In case value contains =
  if (key && value !== undefined) {
    console.log(`  Key: '${key}'`);
    console.log(`  Value: '${value}'`);
    console.log(`  Value length: ${value.length}`);
    // Check for whitespace
    if (value.trim() !== value) {
      console.log(`  WARNING: Value has leading/trailing whitespace`);
    }
  }
});

// Check what dotenv would parse
require('dotenv').config({ path: envPath });
console.log('\nAfter dotenv.config():');
console.log('process.env.TOKEN:', process.env.TOKEN ? `'${process.env.TOKEN}'` : undefined);
console.log('process.env.MONGO_URI:', process.env.MONGO_URI ? `'${process.env.MONGO_URI}'` : undefined);
console.log('process.env.DISCORD_CLIENT_ID:', process.env.DISCORD_CLIENT_ID ? `'${process.env.DISCORD_CLIENT_ID}'` : undefined);