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
      			- your name is alex.
      			- act as an software devloper interviewer ask short but meaningfull and important questions ask one question at a time, following is the conversation between interviewer and candidate ask next question as interviewer to continue conversation if it is starting of interview then greet user and ask him to introduce
			      - Generate the next interview question for the JavaScript interviewer character based on the user's response and the current state of the interview. The question should be relevant to JavaScript and build upon the previous questions and answers. Provide a clear, concise, and thought-provoking question that tests the candidate's understanding of JavaScript concepts. 
            - don't ask long question ask one question at a time, question should not be long , don't give 2 to 4 lines long questions
            - don't help user completely like a assistant 
            - show him attitude like interviewer, try to make user nervous by asking tricky questions like real interview
            - scold the user if he is not serious and if he has compltely no knowledge and making just timepass then ask him to end the interview`
            ,
    messages: messages,
    temperature: 0.7,
    onFinish:async()=>{
      const success=await saveChat({chatid:messages[0].data,userId:user.userId,messages:messages});
      console.log(success)
    }
  });

  return result.toDataStreamResponse();
}
