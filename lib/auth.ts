import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcrypt";
import client from "@/db"

const prisma = client;

export const NEXT_AUTH_CONFIG = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "email", type: "text", placeholder: "" },
        password: { label: "password", type: "password", placeholder: "" },
      },

      async authorize(credentials: any) {
        if (!credentials.username || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.username },
        });
        if(!user){
          throw new Error("User not found with this email");
        }
        if (user && user.password) {
          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );
          if (isPasswordValid) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              userId: user.userId,
            };
          }else{
            throw new Error("Invalid password");
          }
        }
        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }: any) {
      if (account.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              password: '', // Set an empty password for Google-authenticated users
            },
          });
          user.userId = newUser.userId;
        } else {
          user.userId = existingUser.userId;
        }
      }
      return true;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.uid = user.id;
        token.userId = user.userId;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.uid;
        session.user.userId = token.userId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
};
