const https = require('https');
require('dotenv').config();

const token = process.env.TOKEN;
if (!token) {
  console.error('No token found');
  process.exit(1);
}

const options = {
  hostname: 'discord.com',
  path: '/api/v10/oauth2/applications/@me',
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
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();