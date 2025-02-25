'use client'
import { useState } from 'react';
import ClassesSidebar from './components/ClassesSidebar';
import ClassForum from './components/ClassForum';
import WebChat from './components/WebChat';
import type { Class } from './utils/interfaces';

export default function Home() {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const handleCloseForum = () => {
    setSelectedClass(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <ClassesSidebar onClassSelectAction={setSelectedClass} />

      {/* Main content */}
      <div className="flex-1 p-8">
        {selectedClass ? (
          <div className="flex h-screen">
            <div className="w-3/5 p-4 border-r overflow-y-auto h-full">
              <ClassForum 
                selectedClassId={selectedClass.courseId} 
                onCloseAction={handleCloseForum}
              />
            </div>
            <div className="w-2/5 p-4 overflow-y-auto h-full">
              <WebChat selectedClass={{
                courseId: selectedClass.courseId,
                courseQuarter: selectedClass.courseQuarter
              }} />
            </div>
          </div>
          
        ) : (
          <div className="max-w-4xl text-center space-y-8">
            <h1 className="text-4xl font-bold text-gray-900">Welcome to Study Connect</h1>
            <p className="text-xl text-gray-600">
              Connect with fellow UCSB students, form study groups, and excel together in your academic journey.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Find Study Partners</h2>
                <p className="text-gray-600">Connect with students in your courses and form study groups.</p>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Share Resources</h2>
                <p className="text-gray-600">Exchange study materials and collaborate on course content.</p>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Track Progress</h2>
                <p className="text-gray-600">Monitor your study sessions and academic improvement.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
