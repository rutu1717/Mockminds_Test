"use client"
import { Button } from "./ui/button"
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function Success(){
    const router = useRouter();
    const handleRedirect = () => {
        router.push('/chat');
      };
    return (
        <div className="flex flex-col justify-center items-start ml-10 flex-grow overflow-y-auto h-[calc(100vh-200px)]">
            <div className="text-2xl mb-3 md:text-4xl lg:text-7xl text-white inter-var text-center">
            Perfect your skills with 
            </div>
            <div className="text-2xl mb-3 md:text-4xl lg:text-7xl text-white inter-var text-center">
            AI-driven mock interviews 
            </div>
            <div className="text-base md:text-lg mt-4 mb-10 text-muted-foreground font-normal inter-var text-center">
                Practice with our AI-powered platform that tailors questions to your desired role,
            </div>
            <Button className="text-md font-medium p-4"onClick={handleRedirect}>start interview</Button>
        </div>
    )
}