'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebase';

export default function SignupSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if not authenticated
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md text-center">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900">Welcome to Study Connect!</h2>
        <p className="text-gray-600">Your account has been successfully created.</p>
        
        <button
          onClick={() => router.push('/')}
          className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}