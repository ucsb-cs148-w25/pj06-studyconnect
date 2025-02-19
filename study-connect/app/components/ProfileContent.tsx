import Link from "next/link";
import { User, Class } from "../utils/interfaces";
import { fetchClassByCourseId } from "../utils/functions";
import { useState } from "react";
import { auth } from '../../lib/firebase';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

export default function ProfileContent({ user, setUser }: { user: User, setUser: (user: User) => void }) {
  const db = getFirestore();

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isProfilePicPopupOpen, setIsProfilePicPopupOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Class | null>(null);
  const [selectedProfilePic, setSelectedProfilePic] = useState<string>(user.profilePic);
  const [profilePics, setProfilePics] = useState<string[]>([
    "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg",
    "https://upload.wikimedia.org/wikipedia/en/thumb/a/a8/UC_Santa_Barbara_Gauchos_logo.svg/800px-UC_Santa_Barbara_Gauchos_logo.svg.png",
    "data:image/png;base64,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",
    "data:image/jpeg;base64,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",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWNdZY6xKMtbXV8uiL_JeYrgR5Qos6HfIEbg&s",
    "https://m.media-amazon.com/images/I/71clqRcms1L.jpg"
  ]);

  const handleCourseClick = async (course: string) => {    
    const courseData = await fetchClassByCourseId(course, "20252");
    if (courseData) {
      console.log("courseData: ", courseData);
      setSelectedCourse(courseData);
      setIsPopupOpen(true);
    }
  };

  const handleProfilePicClick = () => {
    setIsProfilePicPopupOpen(true);
  };

  const handleSaveProfilePic = async (url: string) => {
    const authUser = auth.currentUser;
    if (authUser) {
      await setDoc(doc(db, 'users', authUser.uid), {
        profilePic: url
      }, { merge: true });
      setUser({ ...user, profilePic: url });
    }
    setIsProfilePicPopupOpen(false);
  };


  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setIsProfilePicPopupOpen(false);
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
          <div className="flex w-full p-4 justify-between">
            {/* Profile Picture */}
            <div
              className="flex justify-center relative group cursor-pointer"
              onClick={() => handleProfilePicClick()}
            >
              <img
                src={user.profilePic}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover transition-all duration-300 ease-in-out group-hover:opacity-50"
              />
              {/* Pencil Icon centered on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#555555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16 4l4 4L7 16H3v-4L16 4z"></path>
                </svg>
              </div>
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

      {/* Profile Picture Popup */}
      {isProfilePicPopupOpen && (
        <div
          id="popup-overlay"
          className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center"
          onClick={handleOutsideClick}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg relative w-3/5 max-w-2xl"
            onClick={(e) => e.stopPropagation()} // Prevent the popup from closing when clicking inside it
          >
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold text-gray-600">Select a New Profile Picture</h2>
              <button
                onClick={handleClosePopup}
                className="hover:bg-gray-100 rounded-full transition-colors"
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
            </div>
            {/* Profile Pic Selection Grid */}
            {/* You can add your available profile pictures here */}
            <div className="grid grid-cols-5 gap-3 mt-4 gap-y-6">
              {profilePics.map((pic) => (
              <img
                key={pic}
                src={pic}
                alt="Profile"
                className={`w-16 h-16 rounded-full object-cover cursor-pointer border-4 transition ${
                  selectedProfilePic === pic ? "border-green-500" : "border-transparent"
                }`}
                onClick={() => {
                  setSelectedProfilePic(pic);
                }}
              />
              ))}
            </div>
            {/* Save Button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => handleSaveProfilePic(selectedProfilePic)}
                disabled={!selectedProfilePic} // Disable if no pic is selected
                className={`px-4 py-2 rounded-lg text-white font-semibold transition ${
                  selectedProfilePic ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
