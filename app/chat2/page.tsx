import { Appbar } from "@/components/Appbar";
import Chatboxnew from "@/components/Chatboxnew";
import { NEXT_AUTH_CONFIG } from "@/lib/auth";
import { getServerSession } from "next-auth"
import { redirect } from 'next/navigation';

async function getUser() {
  const session = await getServerSession(NEXT_AUTH_CONFIG);
  return session;
}

export default async function Chat2() {
  const session = await getUser();
  if (session==null) {
    redirect('/signin');
  }
  return (
    <div>
      <Appbar />
      <Chatboxnew/>
    </div>
  );
}