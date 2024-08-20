import Signup from '@/components/Signup';
import { NEXT_AUTH_CONFIG } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import React from 'react';

const SignupPage = async () => {
  const session = await getServerSession(NEXT_AUTH_CONFIG);
  if (session?.user) {
    redirect('/');
  }
  return <Signup />;
};

export default SignupPage;