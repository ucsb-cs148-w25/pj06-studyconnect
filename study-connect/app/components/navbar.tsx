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
            
            const db = getFirestore();
            const userDoc = await getDoc(doc(db, 'users', result.user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (!userData.name || !userData.grade || !userData.major) {
                    router.push('/profile');
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

    return (
        <nav className="bg-blue-950 text-amber-500 p-4 sm:p-6">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold">
                    StudyConnect
                </Link>
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Link href="/courses" className="hover:text-gray-300">
                                Courses
                            </Link>
                            <Link href="/profile" className="hover:text-gray-300">
                                Profile
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