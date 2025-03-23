"use client"
import { Button } from "./ui/button"
import { v4 as uuidv4} from 'uuid';
import { useRouter } from 'next/navigation';
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

import DavidMartinez from "../app/images/agents/David Martinez.png";
import MiaRoberts from "../app/images/agents/Mia Roberts.png";
import MichaelAnderson from "../app/images/agents/Michael Anderson.png";
import JakeThompson from "../app/images/agents/Jake Thompson.png";
import EmmaCarter from "../app/images/agents/Emma Carter.png";


const testimonials = [
  {
    image: DavidMartinez,
    name: "David Martinez",
    description:"I love building web apps using modern frameworks and cloud technologies."
  },
  {
    image: MiaRoberts,
    name: "Mia Roberts",
    description:"i am a passionate frontend dev, I specialize in React and Vue.js."
  },
  {
    image: MichaelAnderson,
    name: "Michael Anderson",
    description:"I enjoy designing efficient database schemas and building robust APIs."
  },
  {
    image: JakeThompson,
    name: "Jake Thompson",
    description:"i am a dev-ops engineer. I'm proficient in Docker and Kubernetes."
  },
  {
    image: EmmaCarter,
    name: "Emma Carter",
    description:"I'm passionate  AI engineer and improve user experiences."
  },
];

export default function Success(){
    const router = useRouter();
    const handleRedirect = () => {
        const uniqueId = uuidv4();
        router.push(`/chat?id=${uniqueId}`);
      };
    return (
        <div className="flex flex-col justify-center items-start ml-10 flex-grow overflow-y-auto h-[calc(85vh)]">
            <div className="text-xl mb-3 md:text-3xl lg:text-5xl text-white inter-var text-center">
            perfect your skills with 
            </div>
            <div className="text-xl mb-3 md:text-3xl lg:text-5xl text-white inter-var text-center">
            AI-driven mock interviews 
            </div>
            <div className="text-base md:text-lg mt-4 mb-10 text-muted-foreground font-normal inter-var text-center">
                Practice with our AI-powered platform that tailors questions to your desired role,
            </div>
            <Button className="text-md mb-5 font-medium p-4"onClick={handleRedirect}>start interview</Button>
            <InfiniteMovingCards items={testimonials} direction="left" speed="slow"/>
        </div>
    )
}