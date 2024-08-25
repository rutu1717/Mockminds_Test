"use server"
import client from "@/db"

const prisma = client;

interface ChatParams {
  chatid: string;
  userId: string;
  messages: any;
}

export async function saveChat({ chatid, userId, messages }: ChatParams) {
  try {
    // First, try to find the existing chat
    let chat = await prisma.chat.findUnique({
      where: {
          chatid: chatid,
          userId: userId
      },
    });

    if (chat) {
      // If the chat exists, update it
      chat = await prisma.chat.update({
        where: {
            chatid: chatid,
            userId: userId,
        },
        data: {
          messages: messages,
        },
      });
    } else {
      // If the chat doesn't exist, create a new one
      chat = await prisma.chat.create({
        data: {
          chatid: chatid,
          userId: userId,
          messages: messages,
        },
      });
    }

    return { success: true, chat: chat };
  } catch (error) {
    console.error('Error saving chat:', error);
    return { success: false, error: 'Failed to save chat' };
  }
}