import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import OpenAI from "openai";

function getOpenAIClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAIClient();
    if (!openai) {
      return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 501 });
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { language, difficulty, type } = await request.json();

    if (!language || !difficulty || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const prompt = `Generate a ${difficulty} level ${type} exercise for learning ${language}. 
    Return a JSON object with: question (string), correctAnswer (string), and options (array of 4 strings for multiple choice).
    Make it culturally relevant to Liberian context if possible.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      return NextResponse.json({ error: "Failed to generate exercise" }, { status: 500 });
    }

    let exercise;
    try {
      exercise = JSON.parse(response);
    } catch {
      return NextResponse.json({ error: "Invalid response format" }, { status: 500 });
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error("Error generating exercise:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}