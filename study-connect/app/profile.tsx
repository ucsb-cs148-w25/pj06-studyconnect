import { useState, ChangeEvent } from "react";

type Profile = {
  image: string;
  name: string;
  grade: string;
  major: string;
  about: string;
  classes: string[];
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    image: "/default-profile.png", // Replace with default profile image
    name: "John Doe",
    grade: "12th Grade",
    major: "Computer Science",
    about: "I am passionate about technology and innovation.",
    classes: ["AP Calculus BC", "Physics C", "Computer Science"],
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleClassChange = (index: number, value: string) => {
    const updatedClasses = [...profile.classes];
    updatedClasses[index] = value;
    setProfile((prev) => ({ ...prev, classes: updatedClasses }));
  };

  const addClass = () => {
    setProfile((prev) => ({ ...prev, classes: [...prev.classes, ""] }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];


    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }


  };

  return (
    <div className="flex flex-col items-center p-6 max-w-xl mx-auto border rounded-lg shadow-lg">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="mb-4"
      />
      <img src={profile.image} alt="Profile" className="w-32 h-32 rounded-full object-cover mb-4" />
      <input
        type="text"
        name="name"
        value={profile.name}
        onChange={handleChange}
        className="border p-2 rounded w-full mb-2"
      />
      <input
        type="text"
        name="grade"
        value={profile.grade}
        onChange={handleChange}
        className="border p-2 rounded w-full mb-2"
      />
      <input
        type="text"
        name="major"
        value={profile.major}
        onChange={handleChange}
        className="border p-2 rounded w-full mb-2"
      />
      <textarea
        name="about"
        value={profile.about}
        onChange={handleChange}
        className="border p-2 rounded w-full mb-4"
      />
      <h2 className="text-lg font-bold mb-2">Classes Currently Enrolled In</h2>
      {profile.classes.map((course, index) => (
        <input
          key={index}
          type="text"
          value={course}
          onChange={(e) => handleClassChange(index, e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
      ))}
      <button onClick={addClass} className="bg-blue-500 text-white p-2 rounded mt-2">Add Class</button>
    </div>
  );
}
