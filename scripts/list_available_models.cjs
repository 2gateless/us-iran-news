const https = require('https');
require('dotenv').config();

const API_KEY = process.env.GOOGLE_API_KEY;

const options = {
  hostname: 'generativelanguage.googleapis.com',
  port: 443,
  path: `/v1beta/models?key=${API_KEY}`,
  method: 'GET'
};

console.log(`Checking available models for the provided API key...`);

const req = https.request(options, (res) => {
  let responseData = '';
  res.on('data', (d) => { responseData += d; });
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    try {
      const json = JSON.parse(responseData);
      if (json.models) {
        console.log('Available Models:');
        json.models.forEach(m => console.log(` - ${m.name}`));
      } else {
        console.log('No models found or error:', JSON.stringify(json, null, 2));
      }
    } catch (e) {
      console.log('Raw Response:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.end();
