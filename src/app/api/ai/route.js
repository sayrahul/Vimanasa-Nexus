import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { prompt, context } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      return Response.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const contextString = context ? JSON.stringify(context) : 'No additional context provided';
    const fullPrompt = `You are an AI assistant for Vimanasa Nexus, an enterprise management system. You have access to business data including workforce, payroll, finance, and compliance information.

Business Context: ${contextString}

User Question: ${prompt}

Provide a helpful, concise response based on the available data. If the data doesn't contain the information needed, say so clearly.`;

    const result = await model.generateContent([fullPrompt]);
    const response = await result.response;
    const text = response.text();

    return Response.json({ text });
  } catch (error) {
    console.error('Gemini AI Error:', error);
    return Response.json({ 
      error: 'Failed to generate AI response',
      details: error.message 
    }, { status: 500 });
  }
}
