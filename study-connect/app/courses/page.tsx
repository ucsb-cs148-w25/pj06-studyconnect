'use client';
import Image from "next/image";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, getDocs, updateDoc, arrayUnion, arrayRemove, setDoc, collection } from 'firebase/firestore';
import { SUBJECTCODES, QUARTERMAP } from "../utils/consts";
import ClassesSidebar from '../components/ClassesSidebar'
import { fetchProfessorsByDepartment } from "@/lib/fetchRMP";
import { User, Class, Instructor, TimeLocation, Professor, JoinedClass } from '../utils/interfaces';

import { 
  Select, MenuItem, InputLabel, FormControl, TextField, SelectChangeEvent,
  Card, CardContent, Typography, Box, Button,
  selectClasses
} from '@mui/material';
import { fetchClassByCourseId } from "../utils/functions";

export default function ExploreCourses() {
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const defaultClass: Class = {
    courseQuarter: '20252',
    courseId: 'No Class',
    courseTitle: '',
    courseDescription: '',
    courseDetails: [],
    deptCode: '',
    classSections: []
  };

  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('');
  const [selectedName, setSelectedName] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<Class>(defaultClass);
  const [selectedSearchType, setSelectedSearchType] = useState<string>('name');
  const [classesLoading, setClassesLoading] = useState<boolean>(false);
  const [classesError, setClassesError] = useState<boolean>(false);
  const [displayedClasses, setDisplayedClasses] = useState<Class[]>([]);
  const [professorData, setProfessorData] = useState<Professor[]>([]);
  const [joinedClasses, setJoinedClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(selectedClass.courseId);
  const [selectedClassQuarter, setSelectedClassQuarter] = useState<string | null>(selectedClass.courseQuarter);
  const [selectedQuarter, setSelectedQuarter] = useState<string | null>('20252');


  const fetchClasses = async (response: any) => {
    const data = response.classes;
    const newClasses = data.map((cls: any) => {
      let courseDetails: { instructor: Instructor; timeLocation: TimeLocation[] }[] = [];
      // current method of processing instructors for each course is inconsistent for multiple instructors
      // does not account for courses with multiple instructors (ex. WINTER 2025 MATH 4B)
      // also may be slightly buggy for courses with no instructors
      let currLeadInstructors: Instructor[] = [];
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
        console.log("cls.courseId", cls.courseId, "instructorNames", instructorNames);

        courseDetails.push({
          instructor: {name: instructorNames.join(" & "), functionCode: "Teaching and in charge"},
          timeLocation: sectionTimeLocations,
        });
      });

      return {
        courseQuarter: cls.quarter,
        courseId: cls.courseId,
        courseTitle: cls.title,
        courseDescription: cls.description,
        deptCode: cls.deptCode,
        classSections: cls.classSections,
        courseInstructors: cls.classSections.map((section: any) => section.instructors),
        courseTimeLocations: cls.classSections.map((section: any) => section.timeLocations as TimeLocation[]),
        courseDetails: courseDetails,
      }
    });
    return newClasses;
  }

  const fetchClassesByName = async (name: string) => {
    if (name.trim() === '') {
      setDisplayedClasses([]);
      return;
    }
    setClassesLoading(true);
    setClassesError(false);
    try {
      const response = await fetch(`/api/classes/?quarter=${selectedQuarter}&title=${encodeURIComponent(name)}&pageSize=100`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      let classes: Class[] = await fetchClasses(data);
      setDisplayedClasses(classes);
    } catch {
      setError(`Failed to load classes for name '${name}'`);
    } finally {
      setLoading(false);
      setClassesLoading(false);
    }
  }

  const fetchClassesBySubjectCode = async (subjectCode: string) => {
    if (subjectCode.trim() === '') {
      setDisplayedClasses([]);
      return;
    }
    setClassesLoading(true);
    setClassesError(false);
    try {
      const response = await fetch(`/api/classes?quarter=${selectedQuarter}&subjectCode=${encodeURIComponent(subjectCode)}&pageSize=100`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      const classes: Class[] = await fetchClasses(data);
      setDisplayedClasses(classes);
    } catch {
      setError(`Failed to load classes for subjectCode '${subjectCode}'`);
    } finally {
      setLoading(false);
      setClassesLoading(false);
    }
  };
    
  useEffect(() => {
    const fetchUser = async (userId: string) => {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setUser(userData);
        console.log("userData: ", userData);
        const classObjects = await Promise.all(userData.joinedClasses.map(async (class_: JoinedClass) => {
          return await fetchClassByCourseId(class_.courseId, class_.courseQuarter);
        }));
        console.log("classObjects", classObjects);
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
      } else {
        console.log("No such document!");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUserId(currentUser.uid);
        fetchUser(currentUser.uid);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    fetchClassesBySubjectCode(selectedSubjectCode)
    fetchClassesByName(selectedName)
    
    return () => unsubscribe();
  }, [selectedQuarter]);

  useEffect(() => {
    const fetchRMPData = async () => {
      if (selectedClass.classSections.length > 0) {
        const fullInstructorName =
          selectedClass.classSections[0].instructors[0]?.instructor ||
          selectedClass.courseDetails[0].instructor.name ||
          'N/A';
        const cleanedDepartmentCode = selectedClass.deptCode.trim();
        console.log(selectedClass);

        // Format instructor name for RMP lookup
        const nameParts = fullInstructorName.split(' ').filter(part => part.trim() !== '');
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
  }, [selectedClass]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const handleSelectedNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedName(event.target.value);
    fetchClassesByName(event.target.value);
  }

  const handleSelectedSubjectCode = (event: SelectChangeEvent<string>) => {
    setSelectedSubjectCode(event.target.value);
    fetchClassesBySubjectCode(event.target.value);
  }

  const handleSearchTypeChange = (event: SelectChangeEvent<string>) => {
    setSelectedSearchType(event.target.value);
    if (event.target.value === 'name') {
      fetchClassesByName(selectedName);
      setSelectedSubjectCode('');
    } else if (event.target.value === 'subjectCode') {
      fetchClassesBySubjectCode(selectedSubjectCode);
      setSelectedName('');
    }
  }

  const handleCardClick = (obj: Class) => {
    console.log("obj", obj);
    setSelectedClass(obj);
  }

  const searchOption = () => {
    if (selectedSearchType === 'name') {
      return (
        <FormControl fullWidth margin="none">
          <TextField
            id="searchName"
            label="Class Name"
            value={selectedName}
            onChange={handleSelectedNameChange}
            margin="none"
          />
        </FormControl>
      );
    } else if (selectedSearchType === 'subjectCode') {
      return (
        <FormControl fullWidth margin="none">
          <InputLabel id="searchType-label">Subject Code</InputLabel>
          <Select
            labelId="searchSubjectCode-label"
            id="searchSubjectCode"
            label="subjectCode"
            onChange={handleSelectedSubjectCode}
            value={selectedSubjectCode}
            margin="none"
          >
            {SUBJECTCODES.map((subjectCode) => (
              <MenuItem key={subjectCode} value={subjectCode}>
                {subjectCode}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }
    return null;
  };

  const filteredClassesGrid = () => {
    if (displayedClasses.length === 0 && !loading && !classesLoading) {
      return (
        <div>
          <p>No classes found!</p>
        </div>
      );
    }
    return (
      <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(150px, 1fr))" gap={2} style={{ marginTop: 20 }}>
        {displayedClasses.map((classObj) => (
          <Card
            key={classObj.courseId}
            onClick={() => handleCardClick(classObj)}
            style={{
              cursor: 'pointer',
              border: selectedClass.courseId === classObj.courseId ? '2px solid blue' : 'none',
              backgroundColor: user && user.joinedClasses.some((cls) => cls.courseId === classObj.courseId && cls.courseQuarter === classObj.courseQuarter) ? 'lightgreen' : 'white'
            }}
          >
            <CardContent>
              <Typography variant="h6" component="div" style={{ fontSize: '1.0rem' }}>
                {classObj.courseId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {classObj.courseTitle}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };

  const classInfo = () => {
    if (selectedClass.courseId === 'No Class') {
      return (
        <div>
          <p>No class selected yet!</p>
        </div>
      );
    }

    let info = null;
    if (selectedClass.courseDetails.length === 0) {
      info = (
        <div>
          <p>Course ID: {selectedClass.courseId}</p>
          <p>Class Name: {selectedClass.courseTitle}</p>
          <p>Description: {selectedClass.courseDescription}</p>
          <p>Instructor: N/A</p>
        </div>
      );
    } else {
      info = (
        <div>
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
        </div>
      );
    }

    let isJoined = false;
    if (user) {
      isJoined = user.joinedClasses.some((cls) => cls.courseId === selectedClass.courseId && cls.courseQuarter === selectedClass.courseQuarter);
    }

    const joinButton = (
      <Button
        onClick={async () => {
          if (user) {
            try {
              const userRef = doc(db, "users", userId);
              const userDoc = await getDoc(userRef);
              console.log(userDoc);
              const courseRef = doc(db, "courses", selectedClass.courseId + "_" + selectedClass.courseQuarter);
              const courseDoc = await getDoc(courseRef);
              console.log(courseDoc);
              if (userDoc.exists()) {
                console.log("User exists");
                await updateDoc(userRef, {
                  joinedClasses: arrayUnion({ courseId: selectedClass.courseId, courseQuarter: selectedClass.courseQuarter })
                });
              } else {
                await setDoc(userRef, {
                  joinedClasses: [{ courseId: selectedClass.courseId, courseQuarter: selectedClass.courseQuarter }]
                });
              }

              if (courseDoc.exists()) {
                console.log("Course exists");
                await updateDoc(courseRef, {
                  members: arrayUnion(userId)
                });
              } else {
                await setDoc(courseRef, {
                  members: [userId]
                });
              }

              setUser({
                ...user,
                joinedClasses: [...user.joinedClasses, { courseId: selectedClass.courseId, courseQuarter: selectedClass.courseQuarter }]
              });
            } catch (error) {
              console.error("Error updating document: ", error);
            }
          }
        }}
        variant="contained"
        color="primary"
        disabled={isJoined}
      >
        Join Class
      </Button>
    );
    const leaveButton = (
      <Button
        onClick={async () => {
          if (user) {
            try {
              const userRef = doc(db, "users", userId);
              const userDoc = await getDoc(userRef);
              const courseRef = doc(db, "courses", selectedClass.courseId + "_" + selectedClass.courseQuarter);
              const courseDoc = await getDoc(courseRef);
              console.log(courseDoc);
              if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData && userData.joinedClasses) {
                  await updateDoc(userRef, {
                    joinedClasses: arrayRemove({ courseId: selectedClass.courseId, courseQuarter: selectedClass.courseQuarter })
                  });
                } else {
                  console.log("No joinedClasses field to remove from");
                }

                setUser({
                  ...user,
                  joinedClasses: user.joinedClasses.filter((cls) => cls.courseId !== selectedClass.courseId && cls.courseQuarter !== selectedClass.courseQuarter)
                });
              } else {
                console.log("No such document!");
              }
              if (courseDoc.exists()) {
                await updateDoc(courseRef, {
                  members: arrayRemove(userId)
                });
              } else {
                console.log("No such document!");
              }
            } catch (error) {
              console.error("Error updating document: ", error);
            }
          }
        }}
        variant="contained"
        color="error"
        disabled={!isJoined}
      >
        Leave Class
      </Button>
    );
    return (
      <div>
        {info}
        <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
          <Box mr={2}>{joinButton}</Box>
          <Box>{leaveButton}</Box>
        </Box>
      </div>
    );
  };

  return (
    <div className="flex flex-row items-stretch justify-center min-h-screen w-screen bg-gray-50">
      <ClassesSidebar setSelectedClassId={setSelectedClassId} setSelectedClassQuarter={setSelectedClassQuarter} setSelectedClass={setSelectedClass} />
      {/* left panel */}
      <div className="flex flex-col flex-1 p-8 space-y-8 bg-white rounded-lg shadow-md m-4 min-h-screen overflow-y-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Explore Classes for{' '}
            <select
              className="bg-white text-gray-900 font-semibold ml-2"
              value={selectedQuarter ? selectedQuarter.slice(4) : ""}
              onChange={(e) => {
                setSelectedQuarter("2025" + e.target.value);
              }}
            >
              {Object.keys(QUARTERMAP).map((quarter) => (
                <option key={quarter} value={quarter}>
                  {QUARTERMAP[quarter as keyof typeof QUARTERMAP]} 2025
                </option>
              ))}
            </select>
          </h1>
          <p className="mt-2 text-gray-600">Search for classes to join</p>
        </div>
        <div className="flex-grow flex flex-col justify-between overflow-auto">
          <div style={{ marginBottom: 20, marginTop: 5 }}>
            <FormControl fullWidth margin="none">
              <InputLabel id="searchType-label">Search Class By</InputLabel>
              <Select
                labelId="searchType-label"
                id="searchType"
                label="Search Class By"
                onChange={handleSearchTypeChange}
                value={selectedSearchType}
                margin="none"
              >
                <MenuItem value="name">Search Class By Name</MenuItem>
                <MenuItem value="subjectCode">Search Class By Subject Code</MenuItem>
              </Select>
            </FormControl>
            <div style={{ marginTop: 20 }}>{searchOption()}</div>
            <div style={{ marginTop: 20 }}>{filteredClassesGrid()}</div>
          </div>
        </div>
      </div>

      {/* right panel */}
      <div className="flex flex-col flex-1 p-8 space-y-8 bg-white rounded-lg shadow-md m-4 min-h-screen overflow-y-auto sticky top-0 h-1">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Class Info</h1>
          <p className="mt-2 text-gray-600">Basic class information</p>
        </div>
        <div className="flex-grow flex flex-col justify-between overflow-auto text-gray-600">
          {classInfo()}
        </div>
      </div>
    </div>
  );
}