'use client'
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User } from '../utils/interfaces';
import Image from 'next/image';
import Link from 'next/link';

const ProfileContent = dynamic(() => import('../components/ProfileContent'), {
  ssr: false,
  loading: () => (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    )
});

export default function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (!user) {
            router.push('/');
            return;
        }

        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                console.log("userData: ", userData);
                console.log("user.uid in profile page: ", user.uid); 
                setUser({
                    userId: user.uid || '',
                    name: userData.name || '',
                    email: user.email || '',
                    grade: userData.grade || '',
                    major: userData.major || '',
                    minor: userData.minor || '',
                    joinedClasses: userData.joinedClasses || [],
                    profilePic: userData.profilePic || 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg',
                    aboutMe: userData.aboutMe || '',
                    friends: userData.friends || [],
                    friendRequests: userData.friendRequests || []
                });
            }
        } catch (error) {
            console.error("Error getting user document: ", error);
        }
      });

      return () => unsubscribe();
    }, [router]);

    if (!user) {
      return (
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    return (
      <Suspense fallback={<div className="h-screen flex justify-center items-center">Loading...</div>}>
        <ProfileContent user={user} setUser={setUser} />

      </Suspense>
    );
}