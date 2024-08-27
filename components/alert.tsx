"use client"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    } from "@/components/ui/alert-dialog"
    import React from 'react';
    import { useRouter } from 'next/navigation';

    export default function AlertDial({children}:{children:React.ReactNode}) {
    const router = useRouter();
    const handleRedirect = () => {
        router.push('/');
    };
    return (
        <AlertDialog>
        <AlertDialogTrigger asChild>
            {children}
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to end the interview?</AlertDialogTitle>
            <AlertDialogDescription>
                If you proceed, this interview will end permanently. The results will be saved to the database, and you will not be able to restart the interview session.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-700 hover:bg-red-700 hover:text-white" onClick={handleRedirect}>end</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
    )
    }
  