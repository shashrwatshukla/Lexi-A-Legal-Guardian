"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to intro page
    router.replace('/intro');
  }, [router]);
  
  return null;
}