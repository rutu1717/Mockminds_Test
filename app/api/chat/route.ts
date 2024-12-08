import { streamText,generateObject } from "ai";
import { z } from "zod";
import { createOpenAI as createGroq } from "@ai-sdk/openai";
import { saveChat } from "@/actions/saveChat";
import { getServerSession } from "next-auth";
import { NEXT_AUTH_CONFIG } from "@/lib/auth";
import prisma from "@/db";
import { NextResponse } from "next/server";
import { log } from "console";
import { json } from "stream/consumers";
const messageTimestamps = new Map(); 
type Message = {
  content: string;
};
const feedbackSchema = z.object({
  rating: z.object({
    technical: z.number().min(1).max(5).describe("Technical skill rating from 1 to 5."),
    behavioral: z.number().min(1).max(5).describe("Behavioral skill rating from 1 to 5."),
    overall: z.number().min(1).max(5).describe("Overall rating from 1 to 5, based on all aspects."),
  }).describe("Ratings across different skill areas."),
  comments: z.string().describe("Detailed critical feedback on the candidate's performance."),
  improvementSuggestions: z.array(z.string()).describe("List of specific areas for improvement."),

});

function isSessionEnded(duration: number): boolean {
  if (messageTimestamps.size < 3) {
    console.log("Not enough messages to check session.");
    return false;
  }
  
  // Get the timestamps of the third and last messages
  console.log(Array.from(messageTimestamps.entries()));
  const firstMessageTime = messageTimestamps.get(2);
  const lastMessageTime = messageTimestamps.get(messageTimestamps.size);

  const timeDifference = lastMessageTime - firstMessageTime;
  console.log("First message time:", firstMessageTime);
  console.log("Last message time:", lastMessageTime);
  console.log("Time difference:", timeDifference);
  console.log("Duration is", duration);

  return timeDifference > duration;
}
async function getUser() {
  const session = await getServerSession(NEXT_AUTH_CONFIG);
  return session;
}
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
const groq = createGroq({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});
const sessionDuration = 80000;
const base_grading_feedback = `
As an AI grader, provide detailed, critical feedback on the candidate's performance by:
- Say if candidate provided any working solution or not in the beginning of your feedback.
- Outlining the optimal solution and comparing it with the candidate’s approach.
- Highlighting key positive and negative moments from the interview.
- Focusing on specific errors, overlooked edge cases, and areas needing improvement.
- Using direct, clear language to describe the feedback, structured as markdown for readability.
- Ignoring minor transcription errors unless they significantly impact comprehension (candidate is using voice recognition).
- Ensuring all assessments are based strictly on information from the transcript, avoiding assumptions.
- Offering actionable advice and specific steps for improvement, referencing specific examples from the interview.
- Your feedback should be critical, aiming to fail candidates who do not meet very high standards while providing detailed improvement areas.
- If the candidate did not explicitly address a topic, or if the transcript lacks information, do not assume or fabricate details.
- Highlight these omissions clearly and state when the available information is insufficient to make a comprehensive evaluation.
- Don't repeat, rephrase, or summarize the candidate's answers. Focus on the most important parts of the candidate's solution.
- Avoid general praise or criticism without specific examples to support your evaluation. Be straight to the point.
- Include specific examples from the interview to illustrate both strengths and weaknesses.
- Include correct solutions and viable alternatives when the candidate's approach is incorrect or suboptimal.
- Format all feedback in clear, detailed but concise form, structured as markdown for readability.
- Focus on contributing new insights and perspectives in your feedback, rather than merely summarizing the discussion.

IMPORTANT: If you got very limited information, or no transcript provided, or there is not enough data for grading, or the candidate did not address the problem, \
state it clearly, don't fabricate details. In this case, you can ignore all other instructions and just say that there is not enough data for grading.
`;

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
  messageTimestamps.set(messages.length-1,Date.now());
  let maxTokens=40;
  if (messages.length <= 3 || isSessionEnded(sessionDuration)) {
    messages[0].content = "";
    maxTokens=7100
  }
  const {user} = await getUser();
  const result = await streamText({
    model: groq("mixtral-8x7b-32768"),
    system: messages[0].content,
    messages: messages,
    temperature: 1,
    maxTokens: maxTokens,
    onFinish: async (result: any) => {
      const newMessageIndex = messages.length;
      messages.push({ role: "system", content: result.text });
      messageTimestamps.set(newMessageIndex, Date.now()); // Add a timestamp for the new message

      const success = await saveChat({
        chatid: messages[0].data,
        userId: user.userId,
        messages: messages,
      });


      if (isSessionEnded(sessionDuration)) {
        console.log("Session ended.");
        const sampleMessages = messages.map((msg: Message) => msg.content).join("\n");
        // const feedbackPrompt = `
        //   Based on the following chat session,including a rating, comments, and improvement suggestions:
        //   Chat Summary:
        //   ${sampleMessages}
        // `;

        try {
          const feedback = await generateObject({
            model: groq("llama-3.3-70b-versatile"),
            schema: feedbackSchema,
            prompt: base_grading_feedback + `\n\nChat Summary:\n${sampleMessages}`,
          });
          console.log("Generated feedback:", feedback);
        } catch (error) {
          console.error("Error generating feedback:", error);
        }
      }
    },
  });

  return result.toDataStreamResponse();
}
