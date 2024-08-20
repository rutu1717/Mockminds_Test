import { createOpenAI } from '@ai-sdk/openai'; 
import { generateText } from 'ai'; 

const groq = createOpenAI({ 
    baseURL: 'https://api.groq.com/openai/v1', 
    apiKey: process.env.GROQ_API_KEY, 
}); 

export const ask = async (msg:string): Promise<string> => { 
    const { text }: { text: string } = await generateText({ 
        model: groq('llama3-8b-8192'), 
        prompt: msg, 
    }); 
    return text; 
};