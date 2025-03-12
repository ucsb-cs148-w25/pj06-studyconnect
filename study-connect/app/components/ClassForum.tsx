'use client'
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createPost } from '../actions/postActions';
import { QUARTERMAP } from '../utils/consts';
import ClassMembers from './ClassMembers';
import { Class, Professor } from '../utils/interfaces';
import { fetchClassByCourseId } from '../utils/functions';
import { fetchProfessorsByDepartment } from "@/lib/fetchRMP";
import { set } from 'cypress/types/lodash';

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  classId: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  likes: number;
  likedBy: string[];
}

interface ClassForumProps {
  selectedClassId: string;
  selectedClassQuarter: string;
  onCloseAction: () => void;
}

export default function ClassForum({ selectedClassId, selectedClassQuarter, onCloseAction }: ClassForumProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [professorData, setProfessorData] = useState<Professor[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const router = useRouter();

  const fetchPostsData = async () => {
    setLoading(true);
    try {
      console.log('classId:', selectedClassId); // Debug log
      console.log(`&classQuarter=${selectedClassQuarter ? selectedClassQuarter : "no quarter found"}`);
      const response = await fetch(`/api/posts?classId=${selectedClassId}&classQuarter=${selectedClassQuarter ? selectedClassQuarter : "20251"}`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      console.log('Fetched posts data:', data); // Debug log
      
      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        console.error('Unexpected response format:', data);
        setError('Unexpected response format');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostsData();
    const fetchRMPData = async () => {
      const selectedClass = await fetchClassByCourseId(selectedClassId, selectedClassQuarter);
      setSelectedClass(selectedClass);
      if (selectedClass.classSections.length > 0) {
        const fullInstructorName =
          selectedClass.classSections[0].instructors[0]?.instructor ||
          selectedClass.courseDetails[0].instructor.name ||
          'N/A';
        const cleanedDepartmentCode = selectedClass.deptCode.trim();
        console.log(selectedClass);

        // Format instructor name for RMP lookup
        const nameParts = fullInstructorName.split(' ').filter((part: string) => part.trim() !== '');
        if (nameParts.length >= 2) {
          const lastName = nameParts[0];
          const firstInitialWithDot = nameParts[1].charAt(0) + '.';
          const formattedInstructor = `${lastName} ${firstInitialWithDot}`;

          console.log("department code:", cleanedDepartmentCode);
          console.log("original instructor:", fullInstructorName);
          console.log("will split into:", [lastName, firstInitialWithDot]);

          const rmpData = await fetchProfessorsByDepartment(cleanedDepartmentCode, formattedInstructor);
          setProfessorData(rmpData);
        } else {
          console.log("Could not parse instructor name:", fullInstructorName);
          setProfessorData([]);
        }
      } else {
        setProfessorData([]);
      }
    };
    fetchRMPData();
  }, [selectedClassId, selectedClassQuarter]);

  const formatDate = (timestamp: Post['createdAt']) => {
    if (!timestamp) return '';
    const date = new Date(timestamp._seconds * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMembersClick = () => {
    setIsMembersModalOpen(true);
  };

  const closeMembersModal = () => {
    setIsMembersModalOpen(false);
  };

  const handleInfoClick = () => {
    setIsInfoModalOpen(true);
  };

  const closeInfoModal = () => {
    setIsInfoModalOpen(false);
  };

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target && (e.target as HTMLElement).id === "popup-overlay") {
      closeMembersModal();
      closeInfoModal();
    }
  };

  const classInfo = () => {
    // Assuming you have a function to fetch class info similar to the one in page.tsx
    // Replace this with the actual implementation
    return (selectedClass ?
      (<div className="text-black">
        <p>Course ID: {selectedClass.courseId}</p>
        <p>Class Name: {selectedClass.courseTitle}</p>
        <p>Description: {selectedClass.courseDescription}</p>
        <p>Instructor: {selectedClass.courseDetails[0].instructor.name === "" ? "N/A" : selectedClass.courseDetails[0].instructor.name}</p>
        {professorData.length > 0 && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-bold mb-2">RateMyProfessor Ratings</h3>
            <p>Average Rating: {professorData[0].avgRating.toFixed(1)}/5.0</p>
            <p>Difficulty: {professorData[0].avgDifficulty.toFixed(1)}/5.0</p>
            <p>Would Take Again: {professorData[0].wouldTakeAgainPercent}%</p>
            <p>Number of Ratings: {professorData[0].numRatings}</p>
            <div className="mt-2">
              <p className="font-semibold">Student Comments Summary:</p>
              <p className="text-sm italic">{professorData[0].commentsSummarizedByGPT}</p>
            </div>
          </div>
        )}
      </div>)
      :
      (<p>No class found!</p>)
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">{selectedClassId} - {selectedClassQuarter && QUARTERMAP[selectedClassQuarter[selectedClassQuarter.length - 1] as keyof typeof QUARTERMAP]} {selectedClassQuarter && selectedClassQuarter.substring(0, 4)} Forums</h2>
        <div className="flex justify-between items-center space-x-4 ml-auto">
          <button
            className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={handleInfoClick}
          >
            Info
          </button>
          <button
            className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={handleMembersClick}
          >
            Members
          </button>
        </div>
        <button
          onClick={onCloseAction}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close forum"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* New Post Form */}
      <form 
        action={async (formData) => {
          try {
            const result = await createPost(formData);
            if (result && result.error) {
              setError(result.error);
            } else {
              setError(null);
              // Clear form fields
              const form = document.querySelector('form') as HTMLFormElement;
              if (form) form.reset();
              // Fetch posts again to show the new post
              await fetchPostsData();
            }
          } catch (err) {
            setError('An error occurred while creating the post');
            console.error(err);
          }
        }}
        className="mb-8 space-y-4"
      >
        <input type="hidden" name="classId" value={selectedClassId} />
        <input type="hidden" name="classQuarter" value={selectedClassQuarter} />
        
        <div>
          <input
            type="text"
            name="title"
            placeholder="Post Title"
            className="w-full p-2 border rounded-md text-black placeholder-gray-500"
            required
          />
        </div>
        
        <div>
          <textarea
            name="content"
            placeholder="Write your post..."
            className="w-full p-2 border rounded-md h-24 text-black placeholder-gray-500"
            required
          />
        </div>
        
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Post
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-center mb-4">{error}</div>
      )}

      {/* Posts List */}
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center text-gray-600">No posts yet. Be the first to post!</div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <Link href={`/posts/${post.id}`}>
                <h3 className="text-xl font-semibold mb-2 text-black hover:text-blue-600">
                  {post.title}
                </h3>
                <p className="text-black mb-4">{post.content}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div>
                    Posted by {post.authorName} • {formatDate(post.createdAt)}
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="currentColor"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span>{post.likes || 0}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Members Modal */}
      {isMembersModalOpen && (
        <div
          id="popup-overlay"
          className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center"
          onClick={handleOutsideClick}
        >
          <div
            className="bg-white p-4 rounded-lg shadow-lg relative w-3/5 max-w-md"
            onClick={(e) => e.stopPropagation()} // Prevent the popup from closing when clicking inside it
          >
            <button
              onClick={closeMembersModal}
              className="absolute top-8 right-8 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close popup"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <Suspense fallback={<div className="h-screen flex justify-center items-center">Loading...</div>}>
              <ClassMembers selectedClass={{ courseId: selectedClassId, courseQuarter: selectedClassQuarter }} />
            </Suspense>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {isInfoModalOpen && (
        <div
          id="popup-overlay"
          className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center"
          onClick={handleOutsideClick}
        >
          <div
            className="bg-white p-4 rounded-lg shadow-lg relative w-3/5 max-w-md"
            onClick={(e) => e.stopPropagation()} // Prevent the popup from closing when clicking inside it
          >
            <button
              onClick={closeInfoModal}
              className="absolute top-2 right-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close popup"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            {classInfo()}
          </div>
        </div>
      )}
    </div>
  );
}