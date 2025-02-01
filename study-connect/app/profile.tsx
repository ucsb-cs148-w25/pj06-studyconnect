'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { auth } from '../lib/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<{ name?: string; grade?: string; major?: string; about?: string; profilePhoto?: string }>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col items-center space-y-4">
          {userData.profilePhoto ? (
            <Image
              src={userData.profilePhoto}
              alt="Profile Photo"
              width={100}
              height={100}
              className="rounded-full border"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600">No Image</span>
            </div>
          )}
          <h1 className="text-2xl font-bold">{userData.name || 'User'}</h1>
          <p className="text-gray-600">Grade: {userData.grade || 'N/A'}</p>
          <p className="text-gray-600">Major: {userData.major || 'N/A'}</p>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold">About Me</h2>
          <p className="mt-2 text-gray-700">{userData.about || 'No description provided.'}</p>
        </div>
      </div>
    </div>
  );
}
