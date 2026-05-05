import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function POST(req) {
  const { prompt, context } = await req.json();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent([
      `Business Context: ${JSON.stringify(context)}\n\nQuestion: ${prompt}`
    ]);
    const response = await result.response;
    return Response.json({ text: response.text() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
