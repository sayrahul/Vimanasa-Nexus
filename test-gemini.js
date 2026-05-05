// Test script to verify Gemini AI API connection
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  console.log('🤖 Testing Gemini AI API Connection...\n');

  // Check API key
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    console.error('❌ NEXT_PUBLIC_GEMINI_API_KEY is not set!');
    process.exit(1);
  }

  console.log('✓ API Key found (length:', process.env.NEXT_PUBLIC_GEMINI_API_KEY.length, ')\n');

  try {
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    console.log('📤 Sending test prompt to Gemini AI...');
    const prompt = "Hello! Please respond with a brief greeting to confirm you're working.";
    
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const text = response.text();

    console.log('✓ Response received!\n');
    console.log('📥 AI Response:');
    console.log('─'.repeat(50));
    console.log(text);
    console.log('─'.repeat(50));
    console.log('\n✅ Gemini AI API is working correctly!\n');

    // Test with business context
    console.log('📤 Testing with business context...');
    const businessPrompt = `You are an AI assistant for Vimanasa Nexus, an enterprise management system.
    
Business Context: {"workforce": [{"Employee": "Rajesh Kumar", "Role": "Security Guard", "Status": "Active"}]}

User Question: How many employees do we have?

Provide a helpful response.`;

    const result2 = await model.generateContent([businessPrompt]);
    const response2 = await result2.response;
    const text2 = response2.text();

    console.log('✓ Response received!\n');
    console.log('📥 AI Response:');
    console.log('─'.repeat(50));
    console.log(text2);
    console.log('─'.repeat(50));
    console.log('\n✅ Business context integration working!\n');

  } catch (error) {
    console.error('\n❌ Error testing Gemini AI:');
    console.error('Error:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.error('\n💡 Invalid API Key: The Gemini API key is not valid.');
      console.error('   Get a new key from: https://makersuite.google.com/app/apikey');
    } else if (error.message.includes('quota')) {
      console.error('\n💡 Quota Exceeded: You have exceeded your API quota.');
      console.error('   Check your usage at: https://makersuite.google.com/');
    }
    
    process.exit(1);
  }
}

testGeminiAPI();
