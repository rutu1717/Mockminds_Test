import InterviewFeedback from "@/components/interview-dashboard";
import { NEXT_AUTH_CONFIG } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
async function getUser(){
    const session = await getServerSession(NEXT_AUTH_CONFIG);
    return session;
}
export default function Feedback(){
    const session = getUser();
    if(session == null){
        redirect("/signin");
    }
    return (
        <InterviewFeedback/>
    )
}