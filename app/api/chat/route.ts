import { streamText } from 'ai';
import { createOpenAI as createGroq } from '@ai-sdk/openai';
import { saveChat } from '@/actions/saveChat';
import { getServerSession } from "next-auth"
import { NEXT_AUTH_CONFIG } from "@/lib/auth";
import prisma from '@/db';
import { NextResponse } from 'next/server';
async function getUser() {
  const session = await getServerSession(NEXT_AUTH_CONFIG);
  return session;
}
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
const groq = createGroq({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const chatId = url.searchParams.get('chatId');
    if (!chatId) {
      return NextResponse.json({ error: 'Invalid chatId' }, { status: 400 });
    }

    const chat = await prisma.chat.findUnique({
      where: { chatid: chatId },
    });

    if (!chat) {
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(chat.messages, { status: 200 });
  } catch (error) {
    console.error('Error fetching chat:', getErrorMessage(error));
    return NextResponse.json(
      { error: 'Failed to fetch chat', details: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
export async function POST(req: Request) {
  const { messages} = await req.json();
  const {user} = await getUser();
  const result = await streamText({
    model: groq('llama3-8b-8192'),
    system:messages[0].content,
    messages: messages,
    temperature: 1,
    maxTokens:7100,
    onFinish:async(result: any)=>{
      messages.push({  role: "system",content: result.text })
      console.log(messages[0].data)
      console.log(messages[2].content)
      const success=await saveChat({chatid:messages[0].data,userId:user.userId,messages:messages});
      console.log(success)
    }
  });

  return result.toDataStreamResponse();
}
