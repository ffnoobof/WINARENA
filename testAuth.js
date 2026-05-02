const https = require('https');
require('dotenv').config();

const token = process.env.TOKEN;
if (!token) {
  console.error('No token found');
  process.exit(1);
}

console.log('Attempting to get bot info from Discord API...');

const options = {
  hostname: 'discord.com',
  path: '/api/v10/users/@me',
  method: 'GET',
  headers: {
    'Authorization': `Bot ${token}`
  }
};

const req = https.request(options, (res) => {
  console.log(`Status code: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Response:', data);
    try {
      const parsed = JSON.parse(data);
      if (parsed.id && parsed.username) {
        console.log(`Successfully authenticated as bot: ${parsed.username}#${parsed.discriminator} (${parsed.id})`);
      }
    } catch (e) {
      console.log('Failed to parse response as JSON');
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();

// Also try with Bearer token (though Bot is correct)
console.log('\nTrying with Bearer token...');
const options2 = {
  hostname: 'discord.com',
  path: '/api/v10/users/@me',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
};

const req2 = https.request(options2, (res) => {
  console.log(`Bearer status code: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Bearer Response:', data);
  });
});

req2.on('error', (error) => {
  console.error('Bearer request error:', error);
});

req2.end();