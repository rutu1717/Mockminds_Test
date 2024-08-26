import { streamText } from 'ai';
import { createOpenAI as createGroq } from '@ai-sdk/openai';
import { saveChat } from '@/actions/saveChat';
import { getServerSession } from "next-auth"
import { NEXT_AUTH_CONFIG } from "@/lib/auth";

async function getUser() {
  const session = await getServerSession(NEXT_AUTH_CONFIG);
  return session;
}
const groq = createGroq({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  const { messages} = await req.json();
  const {user} = await getUser();
  const result = await streamText({
    model: groq('llama3-8b-8192'),
    system:
    `You are an software development interviewer ` +
    `Try to ask questions one by one ` +
    `Start the interview with greeting and ask questions with increasing difficulty , if user goes out of context and behaving inappropriate remind him about to stay in his limits , try to simulate entire interview process`,
    messages: messages,
    onFinish:async()=>{
      const success=await saveChat({chatid:messages[0].data,userId:user.userId,messages:messages});
      console.log(success)
    }
  });

  return result.toDataStreamResponse();
}
