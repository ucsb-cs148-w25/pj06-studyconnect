'use client'
import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { db } from '../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User } from '../../utils/interfaces';

const ProfileContent = dynamic(() => import('../../components/ProfileContent'), {
    ssr: false,
    loading: () => (
        <div className="h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
    )
});

export default function UserProfile() {
    const [user, setUser] = useState<User | null>(null);
    const { uid } = useParams(); 

    useEffect(() => {
        if (!uid) return;
        const fetchUserProfile = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', uid as string));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    // console.log("uid in profile[uid]", uid);
                    setUser({
                        userId: uid as string|| '',
                        name: userData.name || '',
                        email: userData.email || '',
                        grade: userData.grade || '',
                        major: userData.major || '',
                        minor: userData.minor || '',
                        joinedClasses: userData.joinedClasses || [],
                        profilePic: userData.profilePic || 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg',
                        aboutMe: userData.aboutMe || '',
                    });
                }
            } catch (error) {
                console.error("Error fetching user profile: ", error);
            }
        };

        fetchUserProfile();
    }, [uid]);

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