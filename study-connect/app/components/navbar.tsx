'use client';
import Link from 'next/link';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export const Navbar = () => {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
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
            const db = getFirestore();
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

    return (
        <nav className="bg-white text-black p-4 sm:p-6">
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