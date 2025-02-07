'use client';
import Image from "next/image";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<User | null>(null); // Replace `any` with `User | null`
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        hd: 'ucsb.edu'
      });
      
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      
      if (!email?.endsWith('@ucsb.edu')) {
        await auth.signOut();
        setError('Please use your UCSB email address to sign in.');
        return;
      }
      
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (!userData.name || !userData.grade || !userData.major) {
          router.push('/profile');
        } else {
          // TODO: Redirect to the main website
          router.push('/'); // Placeholder for the main website
        }
      } else {
        router.push('/profile');
      }
    } catch (error) {
      setError('Failed to sign in. Please try again.');
      console.error(error);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigateToExplore = () => {
    router.push('/explore');
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Study Connect</h1>
          <p className="mt-2 text-gray-600">Connect with UCSB students for study groups</p>
        </div>

        {user ? (
          <div className="space-y-4">
            <p className="text-center text-gray-700">Welcome, {user.email}</p>
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={signInWithGoogle}
              className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Image
                src="/google.svg"
                alt="Google logo"
                width={20}
                height={20}
              />
              Sign in with Google
            </button>
            
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
