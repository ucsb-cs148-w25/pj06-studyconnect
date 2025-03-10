'use client';
import Link from 'next/link';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { auth, db } from '../../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { User as AppUser, FriendRequest } from '../utils/interfaces';

export const Navbar = () => {
    const [user, setUser] = useState<User | null>(null);
    const [appUser, setAppUser] = useState<AppUser | null>(null);
    const [error, setError] = useState<string>('');
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            
            // If user is logged in, fetch their data including friend requests
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                
                // Set up real-time listener for user data
                const userUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setAppUser({
                            userId: user.uid,
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
                });
                
                return () => {
                    userUnsubscribe();
                };
            } else {
                setAppUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    // Close notifications when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
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

            // Get the ID token
            const idToken = await result.user.getIdToken();
            
            // Send the ID token to your backend to create a session cookie
            const response = await fetch('/api/auth/session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idToken }),
            });

            if (!response.ok) {
                throw new Error('Failed to create session');
            }
            
            // Check user profile and redirect if needed
            const userDoc = await getDoc(doc(db, 'users', result.user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (!userData.name || !userData.grade || !userData.major) {
                    router.push('/profile/edit');
                }
            } else {
                router.push('/profile/edit');
            }
        } catch (error) {
            setError('Failed to sign in. Please try again.');
            console.error(error);
        }
    };

    const handleSignOut = async () => {
        try {
            // Clear the session cookie
            await fetch('/api/auth/session', { method: 'DELETE' });
            await auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const getPendingFriendRequests = () => {
        return appUser?.friendRequests?.filter(req => req.status === 'pending') || [];
    };

    const handleAcceptFriendRequest = async (request: FriendRequest) => {
        if (!appUser) return;
        
        try {
            // Update the request status
            const updatedRequests = appUser.friendRequests.map(req => 
                req.requestId === request.requestId ? { ...req, status: 'accepted' } : req
            );
            
            // Add to friends list for both users
            await Promise.all([
                // Update current user
                updateDoc(doc(db, 'users', appUser.userId), {
                    friendRequests: updatedRequests,
                    friends: arrayUnion(request.fromUserId)
                }),
                
                // Update requester
                updateDoc(doc(db, 'users', request.fromUserId), {
                    friends: arrayUnion(appUser.userId)
                })
            ]);
        } catch (error) {
            console.error("Error accepting friend request:", error);
        }
    };

    const handleRejectFriendRequest = async (request: FriendRequest) => {
        if (!appUser) return;
        
        try {
            // Update the request status
            const updatedRequests = appUser.friendRequests.map(req => 
                req.requestId === request.requestId ? { ...req, status: 'rejected' } : req
            );
            
            await updateDoc(doc(db, 'users', appUser.userId), {
                friendRequests: updatedRequests
            });
        } catch (error) {
            console.error("Error rejecting friend request:", error);
        }
    };

    const pendingRequests = getPendingFriendRequests();

    return (
        <nav className="sticky top-0 bg-white text-black p-4 sm:p-6">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-3xl font-bold">
                    study-connect
                </Link>
                <div className="flex items-center gap-8">
                    {user ? (
                        <>
                            <Link href="/courses" className="hover:text-blue-300 text-2xl">
                                courses
                            </Link>
                            <Link href="/profile" className="hover:text-blue-300 text-2xl"> 
                                profile
                            </Link>
                            <Link href="/friends" className="hover:text-blue-300 text-2xl"> 
                                friends
                            </Link>
                            
                            {/* Notification Bell */}
                            <div className="relative" ref={notificationRef}>
                                <button 
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="p-2 hover:bg-blue-900 rounded-full relative"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    
                                    {pendingRequests.length > 0 && (
                                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {pendingRequests.length}
                                        </span>
                                    )}
                                </button>
                                
                                {/* Dropdown for notifications */}
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 overflow-hidden">
                                        <div className="p-3 border-b border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                                        </div>
                                        
                                        <div className="max-h-96 overflow-y-auto">
                                            {pendingRequests.length === 0 ? (
                                                <div className="p-4 text-center text-gray-500">
                                                    No new notifications
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-100">
                                                    {pendingRequests.map(request => (
                                                        <div key={request.requestId} className="p-3 hover:bg-gray-50">
                                                            <div className="flex items-center space-x-3">
                                                                <Image 
                                                                    src={request.fromUserProfilePic} 
                                                                    alt={request.fromUserName}
                                                                    width={40}
                                                                    height={40}
                                                                    className="rounded-full"
                                                                />
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium text-gray-800">
                                                                        <Link href={`/profile/${request.fromUserId}`} className="hover:underline">
                                                                            {request.fromUserName}
                                                                        </Link>
                                                                        <span className="text-gray-600"> sent you a friend request</span>
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {new Date(request.timestamp).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 flex space-x-2">
                                                                <button
                                                                    onClick={() => handleAcceptFriendRequest(request)}
                                                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRejectFriendRequest(request)}
                                                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm"
                                                                >
                                                                    Decline
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <button
                                onClick={handleSignOut}
                                className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={signInWithGoogle}
                            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                            <Image
                                src="/google.svg"
                                alt="Google logo"
                                width={20}
                                height={20}
                            />
                            Sign in with Google
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};