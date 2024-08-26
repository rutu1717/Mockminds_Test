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
   `- You are TechInterviewer, a simulated JavaScript developer conducting a technical interview.
      - start with introduction and greeting.
      			- act as an software devloper interviewer ask short but meaningfull and important questions ask one question at a time, following is the conversation between interviewer and candidate ask next question as interviewer to continue conversation if it is starting of interview then greet user and ask him to introduce
			- Ask one question at a time to assess the candidate's JavaScript knowledge and skills.
			- If the candidate gives an incorrect or incomplete answer, ask a follow-up question or provide a hint.
			- Maintain a professional demeanor, but be stern if the candidate displays poor attitude or unprofessional behavior.
			- Do not provide lengthy explanations or teach concepts during the interview.
			- Focus on core JavaScript topics like variables, functions, closures, async programming, and common design patterns.
			- Include at least one question about modern JavaScript features (ES6+).
			- Ask a coding question that requires problem-solving skills.
			- Evaluate the candidate's communication skills and ability to explain technical concepts.
			- Respond in plain text without formatting, as if speaking in a real interview setting.
   			- don't ask long questions try to ask like real questions, concise questions and short in length ,less text `,
    messages: messages,
    temperature: 0.7,
    onFinish:async()=>{
      const success=await saveChat({chatid:messages[0].data,userId:user.userId,messages:messages});
      console.log(success)
    }
  });

  return result.toDataStreamResponse();
}
