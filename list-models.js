// List available Gemini models
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  console.log('🔍 Listing available Gemini models...\n');

  try {
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    
    // Try different model names
    const modelsToTry = [
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-pro',
      'gemini-pro-vision'
    ];

    for (const modelName of modelsToTry) {
      try {
        console.log(`Testing model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(['Hello']);
        const response = await result.response;
        console.log(`✓ ${modelName} - WORKS!`);
        console.log(`  Response: ${response.text().substring(0, 50)}...\n`);
        break; // Stop after first working model
      } catch (error) {
        console.log(`✗ ${modelName} - ${error.message.substring(0, 80)}...\n`);
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

listModels();
