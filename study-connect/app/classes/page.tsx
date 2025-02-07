'use client'

import { useState } from 'react';

type Class = {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  courseDetails: {
    instructor: Instructor; // if 2 instructors, joined by &
    timeLocation: TimeLocation[];
  }[]
}

type Instructor = {
  name: string;
  functionCode: string;
}

type TimeLocation = {
  room: string;
  building: string;
  roomCapacity: number;
  days: string;
  beginTime: string;
  endTime: string
}

type ClassesList = {
  [key: string]: Class[];
}

// ES became ES   1- to work with its subject code
// ART  CS, INT  CS, MUS  CS, W&L  CS have 2 spaces in their subject code
const SUBJECTCODES = ["ANTH", "ART", "ART  CS", "ARTHI", "ARTST", "AS AM", "ASTRO", "BIOE", "BIOL", "BIOL CS", "BL ST", "CH E", "CHEM CS", "CHEM", "CH ST", "CHIN", "CLASS", "COMM", "C LIT", "CMPSC", "CMPSCCS", "CMPTG", "CMPTGCS", "CNCSP", "DANCE", "DYNS", "EARTH", "EACS", "EEMB", "ECON", "ED", "ECE", "ENGR", "ENGL", "EDS", "ESM", "ENV S", "ESS", "ES   1-", "FEMST", "FAMST", "FR", "GEN S", "GEN SCS", "GEOG", "GER", "GPS", "GLOBL", "GRAD", "GREEK", "HEB", "HIST", "IQB", "INT", "INT  CS", "ITAL", "JAPAN", "KOR", "LATIN", "LAIS", "LING", "LIT", "LIT CS", "MARSC", "MARIN", "MARINCS", "MATRL", "MATH", "MATH CS", "ME", "MAT", "ME ST", "MES", "MS", "MCDB", "MUS", "MUS  CS", "MUS A", "PHIL", "PHYS", "PHYS CS", "POL S", "PORT", "PSY", "RG ST", "RENST", "RUSS", "SLAV", "SOC", "SPAN", "SHS", "PSTAT", "TMP", "THTR", "WRIT", "W&L CSW", "W&L", "W&L  CS"];

const ClassesList = () => {
  const [classes, setClasses] = useState<{[key: string]: Class[]}>({});
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [error, setError] = useState<{[key: string]: string | null}>({});
  const [expanded, setExpanded] = useState<{[key: string]: boolean}>({});
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [currInstructor, setCurrInstructor] = useState<string>("");
  
  const [subjectCodeList, setsubjectCodeList] = useState<string[]>(SUBJECTCODES);

  const fetchClassesBysubjectCode = async (subjectCode: string) => {
    setLoading((prev) => ({ ...prev, [subjectCode]: true }));
    setError((prev) => ({ ...prev, [subjectCode]: null }));
    try {
      const response = await fetch(`/api/classes?quarter=20252&subjectCode=${encodeURIComponent(subjectCode)}&pageSize=100`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();

      let currLeadInstructors: Instructor[] = [];

      const newClasses = data.classes.map((cls: any) => {
        let courseDetails: { instructor: Instructor; timeLocation: TimeLocation[] }[] = [];

        cls.classSections.map((section: any) => {
          const sectionInstructors = section.instructors;
          const sectionTimeLocations = section.timeLocations;
          
          let newLeadInstructors: Instructor[] = [];
          sectionInstructors.forEach((instructor: any) => {
            if (instructor.functionCode === "Teaching and in charge") {
              newLeadInstructors.push({name: instructor.instructor, functionCode: instructor.functionCode});
            }
          });
          
          if (newLeadInstructors.length > 0 && newLeadInstructors !== currLeadInstructors) {
            currLeadInstructors = newLeadInstructors;
          }

          const instructorNames = currLeadInstructors.map((instructor: Instructor) => instructor.name);

          courseDetails.push({
            instructor: {name: instructorNames.join(" & "), functionCode: "Teaching and in charge"},
            timeLocation: sectionTimeLocations,
          });
        });

        return {
          courseId: cls.courseId,
          courseTitle: cls.title,
          courseDescription: cls.description,
          courseInstructors: cls.classSections.map((section: any) => section.instructors),
          courseTimeLocations: cls.classSections.map((section: any) => section.timeLocations as TimeLocation[]),
          courseDetails: courseDetails,
        }});

      setClasses((prev) => ({ ...prev, [subjectCode]: newClasses }));
    } catch {
      setError((prev) => ({ ...prev, [subjectCode]: `Failed to load classes for ${subjectCode}` }));
    } finally {
      setLoading((prev) => ({ ...prev, [subjectCode]: false }));
    }
  };

  const toggleDropdown = (subjectCode: string) => {
    setExpanded((prev) => ({ ...prev, [subjectCode]: !prev[subjectCode] }));
    if (!classes[subjectCode]) {
      fetchClassesBysubjectCode(subjectCode);
    }
  };

  return (
    <div className="flex h-screen">
      {/* left side dropdowns */}
      <div className="w-1/2 p-4 border-r overflow-y-auto h-full">
        <h2>Classes List</h2>
        {subjectCodeList.map((subjectCode) => (
          <div key={subjectCode} className="mb-4">
            <button 
              className="bg-blue-500 text-white font-semibold py-2 px-4 rounded w-full text-left"
              onClick={() => toggleDropdown(subjectCode)}
            >
              {expanded[subjectCode] ? `▼ Hide ${subjectCode} Classes` : `► Show ${subjectCode} Classes`}
            </button>
            {expanded[subjectCode] && (
              <div className="ml-4 mt-2">
                {loading[subjectCode] ? (
                  <p>Loading...</p>
                ) : error[subjectCode] ? (
                  <p className="text-red-500">{error[subjectCode]}</p>
                ) : (
                  classes[subjectCode]?.length === 0 ? (
                    <p>No classes found.</p>
                  ) : (
                    <ul className="list-disc pl-4">
                      {classes[subjectCode]?.map((cls, index) => (
                        <li key={index}>
                          <button 
                            className="text-blue-700 underline hover:text-blue-500"
                            onClick={() => setSelectedClass(cls)}
                          >
                            {cls.courseId} - {cls.courseTitle}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* right side class details */}
      <div className="w-1/2 p-4 overflow-y-auto h-full">
        <h2>Class Details</h2>
        {selectedClass ? (
          <div className="flex flex-col border p-4 rounded shadow">
            <h3 className="text-xl text-center font-semibold">{selectedClass.courseId} - {selectedClass.courseTitle}</h3>
            <hr className="my-4 border-t border-gray-300" />
            <h2 className="text-lg">Description: {selectedClass.courseDescription}</h2>
            <hr className="my-4 border-t border-gray-300" />
            {selectedClass.courseDetails.length === 0 ? "No lectures/sections found." : 
              <div>
                <h2 className="text-lg">Lecture/section times: </h2>
                <div>
                  <ul>
                    {selectedClass.courseDetails.map((detail, index) => {
                      return (
                        <li key={index}>
                          <h3 className="font-semibold">Instructor: {detail.instructor.name}</h3>
                          <ul>
                            {detail.timeLocation.length > 0 ? detail.timeLocation.map((timeLocation, index) => 
                              <li key={index}>
                                <p>{timeLocation.days} {timeLocation.beginTime} - {timeLocation.endTime}</p>
                                <p>Building: {timeLocation.building}; Room: {timeLocation.room}</p>
                                <p># Enrolled in UCSB: </p>
                                <p># Enrolled in StudyConnect: </p>
                                <button className="text-blue-700 underline hover:text-blue-500">Join</button>
                              </li>
                            ) : 
                              <div>
                                <p>No lectures/sections found for this class.</p>
                                <button className="text-blue-700 underline hover:text-blue-500">Join</button>
                              </div>
                            }
                          </ul>
                        </li>
                      )})}
                  </ul>
                </div>
              </div>
            }
          </div>
        ) : (
          <p>Select a class to view details.</p>
        )}
      </div>
    </div>
  );
};  

export default ClassesList;