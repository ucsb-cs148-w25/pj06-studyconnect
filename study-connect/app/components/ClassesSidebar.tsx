"use client"
import { useEffect, useState } from 'react';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface JoinedClass {
  courseId: string;
  courseTitle?: string;
}

interface User {
  joinedClasses: string[];
  name: string;
  email: string;
}

interface ClassesSidebarProps {
  onClassSelectAction: (classId: string) => void;
}

export default function ClassesSidebar({ onClassSelectAction }: ClassesSidebarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [joinedClasses, setJoinedClasses] = useState<JoinedClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async (userId: string) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser(userData);
          const classObjects = userData.joinedClasses.map(classId => ({
            courseId: classId,
          }));
          setJoinedClasses(classObjects);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="w-64 bg-white shadow-md">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">My Classes</h2>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : !user ? (
          <p className="text-gray-600 text-sm">Sign in to view your classes</p>
        ) : joinedClasses.length === 0 ? (
          <p className="text-gray-600 text-sm">No classes joined yet</p>
        ) : (
          <ul className="space-y-2">
            {joinedClasses.map((class_) => (
              <li
                key={class_.courseId}
                className="p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                onClick={() => onClassSelectAction(class_.courseId)}
              >
                <span className="text-gray-800">{class_.courseId}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}