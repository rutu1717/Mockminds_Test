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
        <div className="flex justify-center items-center flex-grow overflow-y-auto h-[calc(100vh-200px)]">
            <Button onClick={handleRedirect}>Start interview</Button>
        </div>
    )
}