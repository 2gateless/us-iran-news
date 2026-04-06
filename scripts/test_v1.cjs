const https = require('https');
require('dotenv').config();

const API_KEY = process.env.GOOGLE_API_KEY;
const MODEL = "gemini-1.5-flash"; // 또는 "gemini-pro"

const data = JSON.stringify({
  contents: [{
    parts: [{ text: "Hello" }]
  }]
});

const options = {
  hostname: 'generativelanguage.googleapis.com',
  port: 443,
  path: `/v1/models/${MODEL}:generateContent?key=${API_KEY}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log(`Testing with v1 endpoint and model: ${MODEL}...`);

const req = https.request(options, (res) => {
  let responseData = '';
  res.on('data', (d) => { responseData += d; });
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log('Response:', responseData);
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.write(data);
req.end();
