import { useEffect, useState } from 'react';
import { JoinedClass } from '../utils/interfaces';
import { getDoc, doc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Avatar } from '@mui/material';

interface ClassMembersProps {
  selectedClass: JoinedClass;
}

export default function ClassMembers({ selectedClass }: ClassMembersProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>(selectedClass.courseId);
  const [selectedClassQuarter, setSelectedClassQuarter] = useState<string>(selectedClass.courseQuarter);
  const [courseMembers, setCourseMembers] = useState<{ name: string; profilePic: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCourseMembers([]);
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const coursesDoc = await getDoc(doc(db, 'courses', selectedClass.courseId + "_" + selectedClass.courseQuarter));
          if (coursesDoc.exists()) {
            const courseData = coursesDoc.data();
            const members = courseData.members;
            console.log("Members:", members);
            const memberData = [];
            for (const member of members) {
              const userDoc = await getDoc(doc(db, 'users', member));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                memberData.push({
                  name: userData.name,
                  profilePic: userData.profilePic,
                });
              }
            }
            // Sort members by name in alphabetical order
            memberData.sort((a, b) => a.name.localeCompare(b.name));
            setCourseMembers(memberData);
          }
        } catch (error) {
          console.error("Error getting course data:", error);
        } finally {
          setLoading(false);
        }
      }
    });
    setSelectedClassId(selectedClass.courseId);
    setSelectedClassQuarter(selectedClass.courseQuarter);

    return () => unsubscribe();
  }, [selectedClass]);

  return (
    <div className="flex flex-col h-[600px] max-w-md mx-auto border rounded-lg overflow-hidden">
      <div className="bg-primary text-primary-foreground p-4">
        <h2 className="text-xl text-black font-bold">
          Members
        </h2>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : courseMembers.length > 0 ? (
          courseMembers.map((member, index) => (
            <div key={index} className="flex items-start space-x-4 mb-4">
              <Avatar src={member.profilePic} alt={member.name}>
                {member.name.charAt(0)}
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-600">{member.name}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No members found.</p>
        )}
      </div>
    </div>
  );
}