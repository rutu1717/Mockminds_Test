"use server"
import bcrypt from 'bcryptjs'
import client from "@/db"

const prisma = client;

interface SignupParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export async function signup({ firstName, lastName,email, password }: SignupParams) {
  try {
    // Check if the email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('Email is already in use.');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
      },
    });

    return {
      success: true,
      userId: user.userId,
    };
  } catch (error:any) {
    console.error('Signup error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred during signup.',
    };
  }
}
