"use client";
import { v4 as uuidv4 } from "uuid";
import { Button } from "./ui/button";
import { useChat } from "ai/react";
import {useSearchParams } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import AlertDial from "./alert";
import { useRouter } from "next/navigation";

type InterviewDetails = {
  agentName: string;
  agentDescription: string;
  difficulty: string;
  requirements: string;
};

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, setMessages,append } =
    useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null); // Specify the type as HTMLDivElement
  const videoRef = useRef<HTMLVideoElement>(null);
  const searchParams = useSearchParams();
  const interviewId = searchParams.get("id");
  const router = useRouter();
  const interviewTime = 1 * 60 * 1000;
  const [interviewDetails, setInterviewDetails] = useState<InterviewDetails | null>(null);;
  const [timeRemaining, setTimeRemaining] = useState(interviewTime); // 30 minutes in milliseconds


  const generateInterviewPrompt = (interviewDetails: InterviewDetails): string => {
    return `
      You are ${interviewDetails.agentName}, ${interviewDetails.agentDescription}.     
      Your role:
        - Greet the candidate and introduce yourself as ${interviewDetails.agentName}.
        - Keep the difficulty level at **${interviewDetails.difficulty}**, as specified.
        - Stay in character as **${interviewDetails.agentName}** throughout the interview.
    
      Begin the interview by introducing yourself as **${interviewDetails.agentName}** and asking the first question.
      You are an AI conducting an interview. Your role is to manage the interview effectively by:
        - Understanding the candidate’s intent, especially when using voice recognition which may introduce errors.
        - Asking follow-up questions to clarify any doubts without leading the candidate.
        - Focusing on collecting and questioning about the candidate’s formulas, code, or comments.
        - Avoiding assistance in problem-solving; maintain a professional demeanor that encourages independent candidate exploration.
        - Probing deeper into important parts of the candidate's solution and challenging assumptions to evaluate alternatives.
        - Providing replies every time, using concise responses focused on guiding rather than solving.
        - Ensuring the interview flows smoothly, avoiding repetitions or direct hints, and steering clear of unproductive tangents.
        - There should be no other delimiters in your response.

        - Your visible messages will be read out loud to the candidate like it is converted into audio to feel like voice to voice conversation so keep in mind response length accordingly.
        - Use mostly plain text, avoid markdown and complex formatting, unless necessary avoid code and formulas in the visible messages.
        - Use '\n\n' to split your message in short logical parts, so it will be easier to read for the candidate.

        - You should direct the interview strictly rather than helping the candidate solve the problem.
        - Be very concise in your responses. Allow the candidate to lead the discussion, ensuring they speak more than you do.
        - Never repeat, rephrase, or summarize candidate responses. Never provide feedback during the interview.
        - Never repeat your questions or ask the same question in a different way if the candidate already answered it.
        - Never give away the solution or any part of it. Never give direct hints or part of the correct answer.
        - Never assume anything the candidate has not explicitly stated.
        - When appropriate, challenge the candidate's assumptions or solutions, forcing them to evaluate alternatives and trade-offs.
        - Try to dig deeper into the most important parts of the candidate's solution by asking questions about different parts of the solution.
        - Make sure the candidate explored all areas of the problem and provides a comprehensive solution. If not, ask about the missing parts.
        - If the candidate asks appropriate questions about data not mentioned in the problem statement (e.g., scale of the service, time/latency requirements, nature of the problem, etc.), you can make reasonable assumptions and provide this information.
    `;
  };


  useEffect(() => {
    const details = sessionStorage.getItem("interview_details");
    if(details) {
    console.log(JSON.parse(details));
    }
    if (details) {
      setInterviewDetails(JSON.parse(details));
    }
  }, []);
  // const [timeRemaining,settimeRemaining] = useState<number>(0);
  // const router = useRouter();
  // Automatically scroll to the bottom when a new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const savedTime = sessionStorage.getItem("endTime");
    if (!savedTime) {
      initializeTimer();
    }
  }, []);

  const initializeTimer = () => {
    const currentTime = Date.now();
    const endTime = currentTime + interviewTime;
    sessionStorage.setItem("endTime", endTime.toString());
  };
  useEffect(() => {
    const interval = setInterval(() => {
      const endTime = sessionStorage.getItem("endTime");
      const remainingTime = Math.max(0, Number(endTime) - Date.now());
      setTimeRemaining(remainingTime);
      if (remainingTime <=0) {
        console.log("Redirecting to problems page");
        append( { data: "chat-end", content: "", role: "assistant" })
        router.push(`/problem?id=${interviewId}`);
        clearInterval(interval); // Stop further redirections
      }
      if (remainingTime <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };
  const startVideo = async () => {
    if (videoRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = stream;
      } catch (error) {
        console.error("Error Accessing Webcam", error);
      }
    }
  };
  useEffect(() => {
    startVideo();
  }, []);
  const newChat = () => {
    if(interviewDetails){
    setMessages((prevMessages) => {
      // Create a new array with the new message as the first element
      prevMessages = [
        { id: "-1", content: generateInterviewPrompt(interviewDetails), role: "system", data: interviewId },
      ];
      // Return the updated messages array
      return prevMessages;
    });
  };
}
// is this needed interview details in dependency array?
  useEffect(newChat, [interviewDetails]);

  return (
    <>
      <div className="flex flex-col">
        <AlertDial>
          <Button className="ml-8 absolute bg-red-700 z-10 hover:bg-red-700 hover:text-white">
            end interview
          </Button>
        </AlertDial>
        <div className="flex justify-center mt-14 mr-auto ml-8">
          <p className="text-lg font-bold text-red-700 bg-red-100 py-2 px-4 rounded-lg shadow-sm">
            {formatTime(timeRemaining)}
          </p>
        </div>
      </div>
      <div className="flex">
        <div className="flex-grow overflow-y-auto custom-scrollbar h-[calc(100vh-200px)]">
          <div className="mx-auto w-full max-w-xl pb-24 flex flex-col text-white">
            <video
              ref={videoRef}
              autoPlay
              className="mb-4 w-full h-auto rounded"
            />
            <div>
              {messages.length > 1 ? (
                messages.map((m) => (
                  <div key={m.id} className="mb-4">
                    {m.content && m.role !== "system"  && (
                      <div
                        className={`flex ${
                          m.role === "user"
                            ? "text-white justify-end"
                            : "text-muted-foreground justify-start"
                        } `}
                      >
                        <div
                          className={`${
                            m.role === "user" ? "bg-muted p-2 px-4" : ""
                          }`}
                        >
                          {m.content}
                        </div>
                      </div>
                    )}
                    <br></br>
                  </div>
                ))
              ) : (
                <div className="absolute inset-0 z-0 flex items-center justify-center">
                  <h1 className="text-6xl font-medium text-muted-foreground opacity-20">
                    mockminds
                  </h1>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="flex-shrink-0">
              <input
                className="fixed w-full max-w-xl bottom-0 mb-8 p-3 focus:outline-none bg-background rounded-none border border-muted placeholder:text-muted-foreground"
                value={input}
                placeholder="Say something..."
                onChange={handleInputChange}
              />
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
