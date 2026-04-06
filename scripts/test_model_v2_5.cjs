const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Say hello");
    console.log("Success with gemini-2.5-flash:", result.response.text());
  } catch (e) {
    console.error("Failed with gemini-2.5-flash:", e.message);
  }
}

test();
