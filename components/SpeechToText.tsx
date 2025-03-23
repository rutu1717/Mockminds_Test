//@ts-nocheck
"use client";
import { FC } from "react";
import { useState,useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

interface TextProps {}

const SpeechToText: FC<TextProps> = ({}) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Add a state to track if the component has mounted
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // if (!browserSupportsSpeechRecognition) {
  //   return <div>Browser does not support speech recognition.</div>;
  // }

  // Only render the component after it has mounted
  if (!isMounted) {
    return null; // or a loading indicator
  }

  return (
    <div>
      {/* ... existing code ... */}
      <h1 className="lg:text-5xl font-bold underline decoration-wavy text-2xl">
        Speech to text
      </h1>
      <p className=" mt-6 pb-32 mb-4 rounded-md bg-base-100 lg:w-96 lg:h-48 w-64 h-64">
        <span className="ml-2 font-bold text-xl bg-base-100">generated text:</span>
        {transcript}
      </p>
        <p className="mb-2 text-xl font-bold">Microphone: {listening ? 'Listing to your voice..' : 'off'}</p>
      <div className="flex gap-3">
        <button className="btn btn-primary btn-sm" onClick={SpeechRecognition.startListening}>Start</button>
        <button className="btn btn-secondary btn-sm" onClick={SpeechRecognition.stopListening}>Stop</button>
        <button className="btn btn-accent btn-sm" onClick={resetTranscript}>Reset</button>
      </div>
    </div>
  );
};
export default SpeechToText;