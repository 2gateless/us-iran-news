const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function finalTest() {
  const models = ["gemini-pro", "gemini-1.0-pro", "gemini-1.5-flash"];
  
  for (const m of models) {
    try {
      console.log(`Testing model: ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Test");
      console.log(`✅ Success with ${m}:`, result.response.text());
      return;
    } catch (e) {
      console.error(`❌ Failed with ${m}:`, e.message);
    }
  }
}

finalTest();
