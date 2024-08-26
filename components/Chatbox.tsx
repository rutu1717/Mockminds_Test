"use client";
import { v4 as uuidv4 } from 'uuid';
import { Button } from './ui/button';
import { useChat } from "ai/react";
import { useRef, useEffect } from "react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit,setMessages} = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null); // Specify the type as HTMLDivElement

  
  // Automatically scroll to the bottom when a new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);


  const newChat = () => {
    setMessages(prevMessages => {
        // Create a new array with the new message as the first element
        prevMessages=[{id:"1",content:"", role:"system", data:uuidv4()}];
        // Return the updated messages array
        return prevMessages;
    });
  };
  useEffect(newChat,[]);
  return (
    <>
    <Button className="ml-8 absolute" onClick={newChat}>+ new chat</Button>  
    <div className="flex-grow overflow-y-auto custom-scrollbar h-[calc(100vh-200px)]">
    <div className="mx-auto w-full max-w-xl pb-24 flex flex-col text-white">
      <div>
        {messages.length > 0
          ? messages.map((m) => (
              <div key={m.id} className="mb-4">
                <div
                  className={`flex ${
                    m.role === "user"
                      ? "text-white justify-end"
                      : "text-muted-foreground justify-start"
                  } `}
                >
                {m.content && (
                  <div className={`${
                    m.role === "user" ? "bg-muted p-2 px-4" : ""
                  }`}>
                    {m.content}
                  </div>
                )}
                </div>
                <br></br>
              </div>
            ))
          : null}
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
    </>
  );
}
