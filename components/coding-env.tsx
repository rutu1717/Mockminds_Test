"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

import {base_problem_generation, base_interviewer, topics} from "@/lib/prompts"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Pen, Eraser, Send, X } from "lucide-react";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { Appbar } from "./Appbar";
import { useChat } from "ai/react";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { useSearchParams } from "next/navigation";
import { log } from "console";
export default function Component() {
  const [mode, setMode] = useState("code");
  const [chatId, setChatId] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [drawTool, setDrawTool] = useState("pen");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [codeContent, setCodeContent] = useState<{ [key: string]: string }>({});
  const [textContent, setTextContent] = useState("");
  const [CodingQuestion, setCodingQuestion] = useState("");
  const problemRef = useRef<string>("");
  const router=useRouter()
  const languages = [
    "javascript",
    "python",
    "java",
    "cpp",
    "sql",
    "typescript",
  ];
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    append,
  } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null); // Specify the type as HTMLDivElement




  // useEffect(()=>{
  //   const savedEndTime = sessionStorage.getItem()
  // },[])
  const fetchChatHistory = async (id: string | null) => {
    try {
      const response = await fetch(`/api/chat?chatId=${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Return null for new chats
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data; // Return the data for existing chats
    } catch (error) {
      console.error("Error fetching chat history:", error);
      return null;
    }
  };


  const generateProblem = async (
    type = "coding",
    difficulty = "medium",
    requirements = ""
  ) => {
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const instructPrompt = `Create a ${type} problem. Difficulty: ${difficulty}. Topic: ${randomTopic}. Additional requirements: ${requirements}.`;
    
    try {
      const response = await fetch('/api/problem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          topic: instructPrompt,
          base_prompt: base_problem_generation
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate problem');
      }

      const data = await response.json();
      if (!data.problem) {
        throw new Error('No problem generated');
      }

      return data.problem;
    } catch (error) {
      console.error('Error generating problem:', error);
      return 'Failed to generate problem. Please try again.';
    }
  };

  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatOpen]); // Add chatOpen to dependencies

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1;
      }
    }
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.strokeStyle = "white";
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (drawTool === "pen") {
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else {
        ctx.clearRect(x - 10, y - 10, 20, 20);
      }
    }
  };

  const [code, setCode] = useState(`function add(a, b) {\n  return a + b;\n}`);

  useEffect(() => {
    switch (language) {
      case "javascript":
        setCode(`function add(a, b) {\n  return a + b;\n}`);
        break;
      case "python":
        setCode(`def add(a, b):\n    return a + b`);
        break;
      case "java":
        setCode(
          `public class Main {\n    public static int add(int a, int b) {\n        return a + b;\n    }\n\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`
        );
        break;
      case "cpp":
        setCode(
          `#include <iostream>\n\nint add(int a, int b) {\n    return a + b;\n}\n\nint main() {\n    // Your code here\n    return 0;\n}`
        );
        break;
      case "typescript":
        setCode(
          `function add(a: number, b: number): number {\n  return a + b;\n}`
        );
        break;
      case "sql":
        setCode(
          `CREATE FUNCTION add(a INT, b INT)\nRETURNS INT\nBEGIN\n  RETURN a + b;\nEND;`
        );
        break;
      default:
        setCode(`// Start coding here`);
    }
  }, [language]);

  const searchParams=useSearchParams();
  const id=searchParams.get("id")
  const initializeInterview = async () => {
    if (id) {
      setChatId(id);
      const chatHistory = await fetchChatHistory(id);
      if (chatHistory) {
        if (chatHistory.length===chatHistory[1].data) {
          console.log('chat-end detected');
          const problem = await generateProblem("coding", "medium", "");
          const updatedMessages = [
            ...chatHistory,
            { id: "-1", content: problem, role: "system"},
            {id:"-1",content:base_interviewer, role:"system"}
          ];
          setMessages(updatedMessages);
          setCodingQuestion(problem);
          append( { id: "-1", content: "start coding round by introducing", role: "system" })
        } else {
          setMessages(chatHistory);
          // Set coding question using the index stored in messages[1].data
          if (chatHistory.length > chatHistory[1].data) {
            setCodingQuestion(chatHistory[chatHistory[1].data].content);
          }
        }
      }
    } else {
      router.push('/');
    }
  };

  useEffect(() => {
    const init = async () => {
      await initializeInterview();
    };
    init();
  }, []);


  const sendMessage = async () => {
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...messages,{ id: "-1", content: "how are you", role: "system", data: id }] }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Handle response if needed
      const data = await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-white">
      <Appbar />

      {/* Main content */}
      <div className="flex-1 pb-4 flex space-x-10 overflow-hidden mx-10">
        {/* Problem Statement Area */}
        <Card className="w-2/5 overflow-hidden bg-background border-muted ">
          <CardContent className="p-0 h-full">
            <div className="h-full overflow-y-auto p-4">
              <div className="prose prose-invert">
                <MarkdownPreview
                  source={CodingQuestion ? CodingQuestion : "Loading..."}
                  style={{ backgroundColor: "#09090b", fontSize: "0.95rem" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coding Area */}
        <Card className="w-3/5 overflow-hidden bg-background border-muted">
          <CardContent className="p-0 h-full flex flex-col">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <div className="flex items-center space-x-2">
                {mode === "code" && (
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-[180px] bg-border text-white border-border">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {mode === "draw" && (
                  <ToggleGroup
                    type="single"
                    value={drawTool}
                    onValueChange={(value) => value && setDrawTool(value)}
                  >
                    <ToggleGroupItem
                      value="pen"
                      className="data-[state=on]:bg-white data-[state=on]:text-black"
                    >
                      <Pen className="w-4 h-4 mr-2" />
                      Pen
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="eraser"
                      className="data-[state=on]:bg-white data-[state=on]:text-black"
                    >
                      <Eraser className="w-4 h-4 mr-2" />
                      Eraser
                    </ToggleGroupItem>
                  </ToggleGroup>
                )}
              </div>
              <ToggleGroup
                type="single"
                value={mode}
                onValueChange={(value) => value && setMode(value)}
              >
                <ToggleGroupItem
                  value="code"
                  className="data-[state=on]:bg-white data-[state=on]:text-black"
                >
                  Code
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="text"
                  className="data-[state=on]:bg-white data-[state=on]:text-black"
                >
                  Text
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="draw"
                  className="data-[state=on]:bg-white data-[state=on]:text-black"
                >
                  Draw
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="flex-1 p-4 relative overflow-hidden">
              {mode === "code" && (
                <div className="overflow-y-auto h-full bg-background rounded-xl">
                  <CodeEditor
                    value={code}
                    language={language}
                    minHeight={200}
                    maxLength={300}
                    placeholder="Please enter JS code."
                    onChange={(evn) => setCode(evn.target.value)}
                    padding={15}
                    style={{
                      backgroundColor: "#09090b",
                      fontFamily:
                        "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                      fontSize: "15px",
                    }}
                  />
                </div>
              )}
              {mode === "text" && (
                <Textarea
                  className="w-full h-full p-5 bg-background text-white"
                  placeholder="Write your text here..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                />
              )}
              {mode === "draw" && (
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={400}
                  className="w-full h-full bg-background focus:outline-none rounded cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseUp={stopDrawing}
                  onMouseOut={stopDrawing}
                  onMouseMove={draw}
                />
              )}
            </div>

            <div className="p-4 border-t border-border relative">
              {chatOpen && (
                <div
                  ref={chatBoxRef}
                  className="absolute bottom-full left-0 right-0 bg-card border border-border rounded-t-lg shadow-lg overflow-hidden "
                  style={{ maxHeight: "calc(75vh - 120px)", zIndex: 10 }}
                >
                  <div className="flex justify-between items-center p-2 bg-card">
                    <span className="text-md text-white">chat</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setChatOpen(false)}
                      className="h-6 w-6 text-gray-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div
                    className="px-4 overflow-y-auto"
                    style={{ maxHeight: "calc(75vh - 160px)" }}
                  >
                    {messages.length > 3 &&
                      messages.map((m) => (
                        <div key={m.id} className="mb-4">
                          {m.content && m.role !== "system" && (
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
                        </div>
                      ))}
                    <div ref={messagesEndRef} />{" "}
                    {/* Ensure this is inside the chat box */}
                  </div>
                </div>
              )}
              <div className="relative">
                <form onSubmit={handleSubmit} className="flex-shrink-0">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Ask a follow up..."
                    value={input}
                    onChange={handleInputChange}
                    onFocus={() => setChatOpen(true)}
                    className="w-full pr-10 py-3 bg-background text-md text-white border-background"
                  />
                  <Button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-transparent p-1"
                  >
                    <Send className="h-5 w-5 text-white focus:outline-none" />
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Button Bar */}
      <div className="flex justify-end p-1 px-6 bg-background">
        <button className="mx-4 my-2 px-3 pt-1 pb-2 rounded-lg text-center bg-white font-medium text-black hover:bg-gray-300">
          restart
        </button>
        <button className="mx-4 my-2 px-3 pt-1 pb-2 rounded-lg text-center bg-white font-medium text-black hover:bg-gray-300">
          submit
        </button>
        <button 
          onClick={sendMessage} 
          className="mx-4 my-2 px-3 pt-1 pb-2 rounded-lg text-center bg-white font-medium text-black hover:bg-gray-300"
        >
          Send Question
        </button>
      </div>
    </div>
  );
}