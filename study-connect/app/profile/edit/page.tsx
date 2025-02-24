'use client'
import { useEffect, useState, useRef, SyntheticEvent } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../lib/firebase';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { MAJORS, MINORS } from '../../utils/consts';
import { User } from '../../utils/interfaces';

export default function ProfileEdit() {
    const router = useRouter();

    const textRef = useRef<HTMLTextAreaElement>(null);

    const onChangeHandler = function(e: SyntheticEvent) {
        const target = e.target as HTMLTextAreaElement;
        textRef.current!.style.height = "30px";
        textRef.current!.style.height = `${target.scrollHeight}px`;
    };

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        grade: '',
        major: '',
        minor: '',
        joinedClasses: [],
        profilePic: '',
        aboutMe: ''
    });

    const [loading, setLoading] = useState(true);
    const [charCount, setCharCount] = useState(0);
    const db = getFirestore();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                router.push('/');
            } else {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setFormData({
                        name: userData.name || '',
                        email: user.email || '',
                        grade: userData.grade || '',
                        major: userData.major || '',
                        minor: userData.minor || '',
                        joinedClasses: userData.joinedClasses || [],
                        profilePic: userData.profilePic || 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg',
                        aboutMe: userData.aboutMe || ''
                    });
                    setCharCount(userData.aboutMe ? userData.aboutMe.length : 0);
                } else {
                    setFormData(prev => ({
                        ...prev,
                        email: user.email || '',
                        joinedClasses: []
                    }));
                }
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router, db]);

    useEffect(() => {
        if (textRef.current) {
            textRef.current.style.height = "30px";
            textRef.current.style.height = `${textRef.current.scrollHeight}px`;
        }
    }, [formData.aboutMe]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (user) {
            await setDoc(doc(db, 'users', user.uid), {
                name: formData.name,
                email: formData.email,
                grade: formData.grade,
                major: formData.major,
                minor: formData.minor,
                joinedClasses: formData.joinedClasses.length ? formData.joinedClasses : [],
                profilePic: formData.profilePic || 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg',
                aboutMe: formData.aboutMe
            });
        }
        router.push('/profile');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'aboutMe' && value.length <= 500) {
            setCharCount(value.length);
        }
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div>
                    <h2 className="text-2xl font-bold text-center text-gray-900">Set Up Your Profile</h2>
                    <p className="mt-2 text-center text-gray-600">Tell us about yourself to get started</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formData.email}
                            disabled
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-700"
                        />
                    </div>

                    <div>
                        <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
                            Grade Level <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="grade"
                            name="grade"
                            required
                            value={formData.grade}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                        >
                            <option value="" disabled>Select Grade Level</option>
                            <option value="Freshman">Freshman</option>
                            <option value="Sophomore">Sophomore</option>
                            <option value="Junior">Junior</option>
                            <option value="Senior">Senior</option>
                            <option value="Graduate">Graduate</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="major" className="block text-sm font-medium text-gray-700">
                            Major <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="major"
                            name="major"
                            required
                            value={formData.major}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                        >

                            <option value="" disabled>Select your major</option>
                            <option value="Undeclared">Undeclared</option>
                            {MAJORS.map((major) => 
                                <option key={major} value={major}>{major}</option>
                            )}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="minor" className="block text-sm font-medium text-gray-700">
                            Minor (Optional)
                        </label>
                        <select
                            id="minor"
                            name="minor"
                            value={formData.minor}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                        >

                            <option value="" disabled>Select your minor</option>
                            <option value=""></option>
                            {MINORS.map((minor) => 
                                <option key={minor} value={minor}>{minor}</option>
                            )}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="aboutMe" className="block text-sm font-medium text-gray-700">
                            About Me (Optional)
                        </label>
                        <textarea
                            id="aboutMe"
                            name="aboutMe"
                            value={formData.aboutMe}
                            ref={textRef}
                            onChange={(e) => {
                                handleChange(e)
                                onChangeHandler(e)
                            }}
                            placeholder="Enter a short bio about yourself"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                            style={{ overflow: 'hidden' }}
                            maxLength={500}
                        />
                        <div className={`text-right text-sm text-${charCount < 500 ? "gray" : "red"}-500`}>{500 - charCount} characters left</div>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Save Profile
                    </button>
                </form>
            </div>
        </div>
    );
}