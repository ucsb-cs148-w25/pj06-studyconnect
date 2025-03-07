import React from "react";
import Navbar from "../components/Navbar"; 
import { Button } from "@/components/ui/button";

const StudyConnectPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="relative w-full bg-gray-900 text-white">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div
          className="relative flex flex-col items-center justify-center text-center py-20 px-4"
          style={{
            backgroundImage: "url('/path-to-background-image.jpg')", // Replace with actual image path
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <h1 className="text-3xl font-bold">Welcome to study-connect!</h1>
          <p className="mt-2 max-w-lg">
            Connect with fellow UCSB students, form study groups, and excel
            together in your academic journey.
          </p>
          <div className="mt-6 flex flex-col gap-4">
            <Button className="bg-black flex items-center px-4 py-2 rounded-lg">
              <img
                src="/google-icon.png"
                alt="Google"
                className="w-5 h-5 mr-2"
              />
              Sign in with Google
            </Button>
            <Button className="bg-gray-700 px-4 py-2 rounded-lg">
              Connect UCSB GOLD
            </Button>
          </div>
        </div>
      </div>

      <section className="bg-black text-white py-12 text-center">
        <h2 className="text-2xl font-semibold">What we allow you to do</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 px-4">
          <div className="bg-white text-black p-6 rounded-lg shadow-md">
            <h3 className="font-bold">Find Study Partners</h3>
            <p>Connect with students in your courses and form study groups.</p>
          </div>
          <div className="bg-white text-black p-6 rounded-lg shadow-md">
            <h3 className="font-bold">Share Resources</h3>
            <p>Exchange study materials and collaborate on course content.</p>
          </div>
          <div className="bg-white text-black p-6 rounded-lg shadow-md">
            <h3 className="font-bold">Track Progress</h3>
            <p>
              Monitor your study sessions and measure academic improvement.
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-black text-white py-6 text-center">footer</footer>
    </div>
  );
};

export default StudyConnectPage;