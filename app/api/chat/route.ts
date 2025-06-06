import { streamText} from "ai";
// import { createOpenAI as createGroq } from "@ai-sdk/openai";
import { saveChat } from "@/actions/saveChat";
import { getServerSession } from "next-auth";
import { NEXT_AUTH_CONFIG } from "@/lib/auth";
import prisma from "@/db";
import { NextResponse } from "next/server";
import { mistral } from '@ai-sdk/mistral'


async function getUser() {
  const session = await getServerSession(NEXT_AUTH_CONFIG);
  return session;
}
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// const groq = createGroq({
//   baseURL: "https://api.groq.com/openai/v1",
//   apiKey: process.env.GROQ_API_KEY,
// });

const model = mistral('mistral-large-latest')

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
  console.log(messages[0].content)
  let maxTokens=100;
  const {user} = await getUser();

  // Check if last message has id "chat-end"
  if (messages[messages.length - 1].data === "chat-end") {
    // Add chat length as string in second element
    messages[1] = {
      ...messages[1],
      data: messages.length
    };
    try {
      const success = await saveChat({
        chatid: messages[0].data,
        userId: user.userId,
        messages: messages,
      });
    } catch (error) {
      console.error('Error saving chat:', getErrorMessage(error));
    }
    return NextResponse.json({ success: true });
  }

  const result = await streamText({
    model: model as any, // Type assertion to bypass type mismatch
    system: messages[0].content,
    messages: messages,
    temperature: 1,
    maxTokens: maxTokens,
    onFinish: async (result: any) => {
      messages.push({ role: "system", content: result.text });
      try {
        const success = await saveChat({
          chatid: messages[0].data,
          userId: user.userId,
          messages: messages,
        });
      } catch (error) {
        console.error('Error saving chat:', getErrorMessage(error));
      }
    },
  });
  return result.toDataStreamResponse();
}
