"use client"
import { useEffect, useState } from 'react';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User, JoinedClass, Class } from '../utils/interfaces';
import { fetchClassByCourseId } from '../utils/functions';
import { QUARTERMAP } from '../utils/consts';
import { set } from 'cypress/types/lodash';

interface ClassesSidebarProps {
  setSelectedClassId: (class_: string | null) => void;
  setSelectedClassQuarter: (quarter: string | null) => void;
  setSelectedClass?: (class_: Class) => void;
}

export default function ClassesSidebar({ setSelectedClassId, setSelectedClassQuarter, setSelectedClass }: ClassesSidebarProps) {
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
          const classObjects = userData.joinedClasses || [];
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
    };

    const unsubscribe = auth?.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [joinedClasses]);

  const groupedClasses = joinedClasses.reduce((acc, class_) => {
    const quarter = class_.courseQuarter;
    if (!acc[quarter]) {
      acc[quarter] = [];
    }
    acc[quarter].push(class_);
    return acc;
  }, {} as Record<string, JoinedClass[]>);

  return (
    <div className="w-64 bg-white shadow-md h-1">
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
          Object.keys(groupedClasses).map((quarter) => (
            <div key={quarter}>
              <h3 className="text-gray-600 text-md font-semibold">{QUARTERMAP[quarter[quarter.length - 1] as keyof typeof QUARTERMAP]} {quarter.substring(0, 4)}</h3>
              <hr className="my-2" />
              <ul className="space-y-2">
                {groupedClasses[quarter].map((class_) => (
                  <li
                    key={class_.courseId}
                    className="p-2 hover:bg-amber-50 rounded-md cursor-pointer"
                    onClick={async () => {
                      if (setSelectedClassId && setSelectedClassQuarter) {
                        const clas: Class = await fetchClassByCourseId(class_.courseId, class_.courseQuarter);
                        console.log("clas", clas);
                        setSelectedClassId(clas.courseId)
                        setSelectedClassQuarter(clas.courseQuarter);
                        if (setSelectedClass) {
                          setSelectedClass(clas);
                        }
                      }
                    }}
                  >
                    <span className="text-gray-800">{class_.courseId}</span>
                  </li>
                ))}
              </ul>
              <hr className="my-2" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}