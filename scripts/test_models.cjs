const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function listModels() {
  try {
    // Note: The SDK doesn't always expose listModels directly easily depending on version
    // But we can try to initialize with gemini-1.5-flash or gemini-2.0-flash-exp
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello");
    console.log("Success with gemini-1.5-flash:", result.response.text());
  } catch (e) {
    console.error("Failed with gemini-1.5-flash:", e.message);
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      const result = await model.generateContent("Hello");
      console.log("Success with gemini-1.5-flash-latest:", result.response.text());
    } catch (e2) {
      console.error("Failed with gemini-1.5-flash-latest:", e2.message);
    }
  }
}

listModels();
