import Link from "next/link";
import { User, Class } from "../utils/interfaces";
import { fetchClassByCourseId } from "../utils/functions";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useState } from "react";

export default function ProfileContent({ user }: { user: User }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Class | null>(null);

    const handleCourseClick = async (course: string) => {    
        const courseData = await fetchClassByCourseId(course, "20252");
        if (courseData) {
            console.log("courseData: ", courseData);
          setSelectedCourse(courseData);  // Update the selected course after fetching
          setIsPopupOpen(true);  // Open the popup after the course is selected
        }
      };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedCourse(null);
  };

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target && (e.target as HTMLElement).id === "popup-overlay") {
      handleClosePopup();
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="rounded-2xl p-6 w-3/5 max-w-2xl">
        
        {/* Profile Section (Box 1) */}
        <div className="bg-white shadow-md rounded-2xl p-6 mb-6">
          <div className="flex w-full">
            {/* Profile Picture */}
            <div className="w-1/3 flex justify-center">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover"
              />
            </div>
  
            {/* User Info */}
            <div className="w-2/3 flex flex-col justify-center px-6">
              <div className="flex justify-between w-full">
                <h2 className="text-gray-600 text-xl font-bold">{user.name}</h2>
                <Link href="/profile/edit" className="text-xs text-amber-500 bg-blue-950 border border-black-500 rounded px-4 py-2">
                  Edit Profile
                </Link>
              </div>
              <p className="text-gray-600">Email: {user.email}</p>
              <p className="text-gray-600">Grade: {user.grade}</p>
              <p className="text-gray-600">Major: {user.major}</p>
              <p className="text-gray-600">Minor: {user.minor !== "" ? user.minor : "N/A"}</p>
            </div>
          </div>
        </div>
  
        {/* Joined Classes Section (Box 2) */}
        <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center">
          <h3 className="text-gray-600 text-lg font-semibold">Courses</h3>
          <div className="w-full mt-4">
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {user.joinedClasses.map((course) => (
                <li key={course} className="text-gray-600 text-center">
                  <button
                    onClick={() => handleCourseClick(course)}
                    className="px-4 py-2 bg-blue-950 text-amber-500 rounded-md hover:bg-blue-950"
                  >
                    {course}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Popup */}
      {isPopupOpen && selectedCourse && (
        <div
          id="popup-overlay"
          className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center"
          onClick={handleOutsideClick}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg relative w-3/5 max-w-2xl">
            <div className="flex justify-end">
                <button
                    onClick={handleClosePopup}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
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
            <h2 className="text-xl font-semibold text-gray-600">Course Details</h2>
            <p className="text-gray-600">Course: {selectedCourse.courseId}</p>
            <p className="text-gray-600">Description: {selectedCourse.courseDescription}</p>
            {selectedCourse.courseDetails.length === 0 ? (<p className="text-gray-600">Instructor: N/A</p>) : (<p className="text-gray-600">Instructor: {selectedCourse.courseDetails[0].instructor.name === "" ? "N/A" : selectedCourse.courseDetails[0].instructor.name}</p>)}
          </div>
        </div>
      )}
    </div>
  );
}