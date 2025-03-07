'use client'
import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { db, auth } from '../../../lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { User, FriendRequest } from '../../utils/interfaces';
import { v4 as uuidv4 } from 'uuid';

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
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [friendStatus, setFriendStatus] = useState<'none' | 'friends' | 'pending' | 'requested'>('none');
    const [isLoading, setIsLoading] = useState(false);
    const { uid } = useParams(); 

    useEffect(() => {
        // Get current logged in user
        const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
            if (authUser) {
                const currentUserDoc = await getDoc(doc(db, 'users', authUser.uid));
                if (currentUserDoc.exists()) {
                    const userData = currentUserDoc.data();
                    setCurrentUser({
                        userId: authUser.uid,
                        name: userData.name || '',
                        email: userData.email || '',
                        grade: userData.grade || '',
                        major: userData.major || '',
                        minor: userData.minor || '',
                        joinedClasses: userData.joinedClasses || [],
                        profilePic: userData.profilePic || 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg',
                        aboutMe: userData.aboutMe || '',
                        friends: userData.friends || [],
                        friendRequests: userData.friendRequests || [],
                    });
                }
            }
        });

        return () => unsubscribe();
    }, []);

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
                        friends: userData.friends || [],
                        friendRequests: userData.friendRequests || [],
                    });
                }
            } catch (error) {
                console.error("Error fetching user profile: ", error);
            }
        };

        fetchUserProfile();
    }, [uid]);

    // Check friend status when both users are loaded
    useEffect(() => {
        if (currentUser && user && currentUser.userId !== user.userId) {
            // Check if they are already friends
            if (currentUser.friends.includes(user.userId)) {
                setFriendStatus('friends');
                return;
            }
            
            // Check if current user has sent a request to this user
            const sentRequest = user.friendRequests?.find(
                req => req.fromUserId === currentUser.userId && req.status === 'pending'
            );
            if (sentRequest) {
                setFriendStatus('requested');
                return;
            }
            
            // Check if this user has sent a request to current user
            const receivedRequest = currentUser.friendRequests?.find(
                req => req.fromUserId === user.userId && req.status === 'pending'
            );
            if (receivedRequest) {
                setFriendStatus('pending');
                return;
            }
            
            setFriendStatus('none');
        }
    }, [currentUser, user]);

    const sendFriendRequest = async () => {
        if (!currentUser || !user) return;
        
        setIsLoading(true);
        try {
            const requestId = uuidv4();
            const newRequest: FriendRequest = {
                requestId,
                fromUserId: currentUser.userId,
                fromUserName: currentUser.name,
                fromUserProfilePic: currentUser.profilePic,
                status: 'pending',
                timestamp: Date.now()
            };
            
            // Add request to the other user's friendRequests
            await updateDoc(doc(db, 'users', user.userId), {
                friendRequests: arrayUnion(newRequest)
            });
            
            setFriendStatus('requested');
        } catch (error) {
            console.error("Error sending friend request:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderFriendButton = () => {
        // Don't show button on own profile
        if (!currentUser || !user || currentUser.userId === user.userId) {
            return null;
        }

        switch (friendStatus) {
            case 'friends':
                return (
                    <button 
                        className="bg-green-500 text-white px-4 py-2 rounded-md"
                        disabled
                    >
                        Friends
                    </button>
                );
            case 'requested':
                return (
                    <button 
                        className="bg-gray-400 text-white px-4 py-2 rounded-md"
                        disabled
                    >
                        Request Sent
                    </button>
                );
            case 'pending':
                return (
                    <button 
                        className="bg-blue-500 text-white px-4 py-2 rounded-md"
                        disabled
                    >
                        Respond to Request
                    </button>
                );
            case 'none':
                return (
                    <button 
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                        onClick={sendFriendRequest}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Add Friend'}
                    </button>
                );
            default:
                return null;
        }
    };

    if (!user) {
        return (
            <div className="h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <Suspense fallback={<div className="h-screen flex justify-center items-center">Loading...</div>}>
            <ProfileContent 
                user={user} 
                setUser={setUser} 
                friendButton={renderFriendButton()}
            />
        </Suspense>
    );
}