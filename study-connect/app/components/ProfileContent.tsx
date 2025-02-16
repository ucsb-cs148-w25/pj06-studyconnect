import Link from "next/link";
import { User } from "../utils/interfaces";

export default function ProfileContent({ user }: { user: User }) {
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
                <h2 className="text-gray-600 text-xl font-semibold">Name: {user.name}</h2>
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
                    <li key={course} className="text-gray-600 text-center">{course}</li>
                ))}
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
}