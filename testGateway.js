const https = require('https');
require('dotenv').config();

const token = process.env.TOKEN;
if (!token) {
  console.error('No token found');
  process.exit(1);
}

console.log('Fetching gateway bot info...');

const options = {
  hostname: 'discord.com',
  path: '/api/v10/gateway/bot',
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
    if (res.statusCode === 200) {
      try {
        const parsed = JSON.parse(data);
        console.log('Gateway URL:', parsed.url);
        console.log('Shards:', parsed.shards);
      } catch (e) {
        console.log('Failed to parse response as JSON');
      }
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();