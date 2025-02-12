'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebase';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { SUBJECTCODES } from '../utils/coursesInfo';

export default function Profile() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        grade: '',
        major: '',
        minor: '',
        joinedClasses: []
    });
    const [loading, setLoading] = useState(true);
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
                        joinedClasses: userData.joinedClasses || []
                    });
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
                joinedClasses: formData.joinedClasses.length ? formData.joinedClasses : []
            });
        }
        router.push('/');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
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
                            Full Name
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
                            Grade Level
                        </label>
                        <select
                            id="grade"
                            name="grade"
                            required
                            value={formData.grade}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                        >
                            <option value="">Select Grade Level</option>
                            <option value="Freshman">Freshman</option>
                            <option value="Sophomore">Sophomore</option>
                            <option value="Junior">Junior</option>
                            <option value="Senior">Senior</option>
                            <option value="Graduate">Graduate</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="major" className="block text-sm font-medium text-gray-700">
                            Major
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
                            {SUBJECTCODES.map((subjectCode) => 
                                <option key={subjectCode} value={subjectCode}>{subjectCode}</option>
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
                            {SUBJECTCODES.map((subjectCode) => 
                                <option key={subjectCode} value={subjectCode}>{subjectCode}</option>
                            )}
                        </select>
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
