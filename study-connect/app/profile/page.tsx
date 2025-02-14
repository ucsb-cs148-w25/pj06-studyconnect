'use client'
import { useState, useEffect } from "react";
import Link from "next/link";
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User, JoinedClass } from '../utils/interfaces';

export default function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const [joinedClasses, setJoinedClasses] = useState<JoinedClass[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async (userId: string) => {
            try {
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists()) {
                const userData = userDoc.data() as User;
                console.log("userData", userData);
                setUser(userData);
                const classObjects = (userData.joinedClasses || []).map(classId => ({
                    courseId: classId,
                }));
                const sortedClasses = classObjects.sort((a, b) => {
                    const regex = /^([A-Za-z]+)\s*(\d+)$/;
                    const matchA = a.courseId.match(regex);
                    const matchB = b.courseId.match(regex);
                
                    if (!matchA || !matchB) {
                    return a.courseId.localeCompare(b.courseId);
                    }
                
                    const deptA = matchA[1];
                    const deptB = matchB[1];
                    const numA = parseInt(matchA[2], 10);
                    const numB = parseInt(matchB[2], 10);
                
                    if (deptA !== deptB) {
                    return deptA.localeCompare(deptB);
                    }
                    return numA - numB;
                });
                setJoinedClasses(sortedClasses);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
              fetchUserData(user.uid);
            } else {
              setLoading(false);
            }
        });
      
        return () => unsubscribe();
    }}, []);

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
          <div className="bg-white shadow-lg rounded-2xl p-6 flex w-3/5 max-w-2xl">
            {/* Profile Picture */}
            <div className="w-1/3 flex justify-center items-center">
              <img
                src="https://via.placeholder.com/150"
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover"
              />
            </div>
            
            {/* User Info */}
            <div className="w-2/3 flex flex-col justify-center px-6">
              <h2 className="text-2xl font-semibold">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-gray-600">{user?.grade}</p>
              <p className="text-gray-600">{user?.major}</p>
              <p className="text-gray-600">{user?.minor}</p>
              {user?.joinedClasses && user.joinedClasses.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold">Joined Classes</h3>
                    <ul className="list-disc list-inside">
                        {joinedClasses.map((class_) => (
                            <li key={class_.courseId}>{class_.courseId}</li>
                        ))}
                    </ul>
                </div>
              )}
              
              <Link href="/profile/edit">Edit Profile</Link>
            </div>
          </div>
        </div>
      );
}