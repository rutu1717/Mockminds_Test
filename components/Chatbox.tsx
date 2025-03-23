"use client";
import { v4 as uuidv4 } from "uuid";
import { Button } from "./ui/button";
import { useChat } from "ai/react";
import { useParams, useSearchParams } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import AlertDial from "./alert";
import { NavigationOff } from "lucide-react";
import { start } from "repl";
import { useRouter } from "next/navigation";
import { time } from "console";
type InterviewDetails = {
  agentName: string;
  agentDescription: string;
  difficulty: string;
  requirements: string;
};

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, setMessages } =
    useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null); // Specify the type as HTMLDivElement
  const videoRef = useRef<HTMLVideoElement>(null);
  const searchParams = useSearchParams();
  const interviewId = searchParams.get("id");
  const router = useRouter();
  const interviewTime = 10 * 60 * 1000;
  const [interviewDetails, setInterviewDetails] = useState<InterviewDetails | null>(null);;
  const [timeRemaining, setTimeRemaining] = useState(interviewTime); // 30 minutes in milliseconds
  const generateInterviewPrompt = (interviewDetails: InterviewDetails): string => {
    return `
      You are ${interviewDetails.agentName}, ${interviewDetails.agentDescription}. 
      You are acting as a technical interviewer for a big-tech company, conducting a structured interview for a candidate.
    
      Your role:
        - Conduct a professional and engaging coding interview.
        - Maintain a conversational yet structured approach, ensuring the candidate feels comfortable while being assessed.
        - Ask one question at a time and wait for the candidate’s response before proceeding.
        - Adjust follow-up questions based on the candidate’s answers to test depth of knowledge.
        - Keep questions relevant to the candidate's expertise level and the technologies mentioned in your description.
    
      Interview Structure:
        1. **Introduction**:
           - Greet the candidate and introduce yourself as ${interviewDetails.agentName}.
           - Briefly explain the interview process and expectations.
        2. **Technical Questions**:
           - Ask well-structured coding questions related to the technologies you specialize in.
           - Cover relevant coding principles and real-world application.
           - Keep the difficulty level at **${interviewDetails.difficulty}**, as specified.
        3. **Follow-ups & Clarifications**:
           - If the candidate struggles, provide minimal clarification but avoid giving direct hints.
           - Ask deeper questions to assess problem-solving skills and practical knowledge.
        4. **Behavioral & System Design (Optional)**:
           - If relevant, ask about experience with architecture, handling state management, debugging techniques, or best practices.
        5. **Closing**:
           - Summarize the interview and ask the candidate if they have any final thoughts or questions.
    
      Important Guidelines:
        - Stay in character as **${interviewDetails.agentName}** throughout the interview.
        - Keep the conversation fluid and adaptive, ensuring a natural interview experience.
        - Do not provide hints or answers unless the candidate explicitly asks for guidance.
        - Avoid generic or overly theoretical questions—focus on real-world coding challenges.
    
      Begin the interview by introducing yourself as **${interviewDetails.agentName}** and asking the first question.
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
      // if (remainingTime <= 570000) {
      //   console.log("Redirecting to problems page");
      //   router.push(`/problem?id=${interviewId}`);
      //   clearInterval(interval); // Stop further redirections
      // }
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
                    {m.content  && (
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
