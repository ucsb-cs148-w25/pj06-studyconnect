'use client';
import Image from "next/image";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { fetchProfessorsByDepartment } from '../../lib/fetchRMP'; 

import { 
  Select, MenuItem, InputLabel, FormControl, TextField, SelectChangeEvent,
  Card, CardContent, Typography, Box, Button
} from '@mui/material';

type Class = {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  deptCode: string;
  courseDetails: {
    instructor: Instructor; // if 2 instructors, joined by &
    timeLocation: TimeLocation[];
  }[];
  classSections: {
    instructors: {
      instructor: string;
      functionCode: string;
    }[];
  }[];
}

type Professor = {
  id: string;
  firstName: string;
  lastName: string;
  avgRating: number;
  avgDifficulty: number;
  numRatings: number;
  wouldTakeAgainPercent: number;
  commentsSummarizedByGPT: string;
};

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

interface User {
  email: string;
  name: string;
  joinedClasses: string[];
}

const SUBJECTCODES = ["ANTH", "ART", "ART  CS", "ARTHI", "ARTST", "AS AM", "ASTRO", "BIOE", "BIOL", "BIOL CS", "BL ST", "CH E", "CHEM CS", "CHEM", "CH ST", "CHIN", "CLASS", "COMM", "C LIT", "CMPSC", "CMPSCCS", "CMPTG", "CMPTGCS", "CNCSP", "DANCE", "DYNS", "EARTH", "EACS", "EEMB", "ECON", "ED", "ECE", "ENGR", "ENGL", "EDS", "ESM", "ENV S", "ESS", "ES   1-", "FEMST", "FAMST", "FR", "GEN S", "GEN SCS", "GEOG", "GER", "GPS", "GLOBL", "GRAD", "GREEK", "HEB", "HIST", "IQB", "INT", "INT  CS", "ITAL", "JAPAN", "KOR", "LATIN", "LAIS", "LING", "LIT", "LIT CS", "MARSC", "MARIN", "MARINCS", "MATRL", "MATH", "MATH CS", "ME", "MAT", "ME ST", "MES", "MS", "MCDB", "MUS", "MUS  CS", "MUS A", "PHIL", "PHYS", "PHYS CS", "POL S", "PORT", "PSY", "RG ST", "RENST", "RUSS", "SLAV", "SOC", "SPAN", "SHS", "PSTAT", "TMP", "THTR", "WRIT", "W&L CSW", "W&L", "W&L  CS"];

const defaultClass: Class = {
  courseId: 'No Class',
  courseTitle: '',
  courseDescription: '',
  deptCode: '',
  courseDetails: [],
  classSections: []
};

export default function Home() {
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('');
  const [selectedName, setSelectedName] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<Class>(defaultClass);
  const [selectedSearchType, setSelectedSearchType] = useState<string>('name');
  const [classesLoading, setClassesLoading] = useState<boolean>(false);
  const [classesError, setClassesError] = useState<boolean>(false);
  const [displayedClasses, setDisplayedClasses] = useState<Class[]>([]);
  const [professorData, setProfessorData] = useState<Professor[]>([]);
  
  const router = useRouter();
    
  useEffect(() => {
    const fetchUser = async (userId: string) => {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setUser(userDoc.data() as User);
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

    return () => unsubscribe();
  }, []);

  // Fetch RMP data when selected class changes
  useEffect(() => {
    const fetchRMPData = async () => {
      if (selectedClass.classSections.length > 0) {
        const fullInstructorName = selectedClass.classSections[0].instructors[0]?.instructor || 'N/A';
        const cleanedDepartmentCode = selectedClass.deptCode.trim();
        
        // Format instructor name for RMP lookup
        const nameParts = fullInstructorName.split(' ').filter(part => part.trim() !== '');
        if (nameParts.length >= 2) {
          // From GOLD API format (e.g. "CONRAD P T" or "KHARITONOVA Y")
          // Create format that fetchRMP expects: "lastName firstInitialWithDot"
          // fetchRMP will:
          // 1. Split by space into [lastName, firstInitialWithDot]
          // 2. Return false if parts.length < 2
          // 3. Remove period from firstInitialWithDot for comparison
          const lastName = nameParts[0];
          const firstInitialWithDot = nameParts[1].charAt(0) + '.'; // Must include period
          const formattedInstructor = `${lastName} ${firstInitialWithDot}`; // Must have space
          
          console.log("department code:", cleanedDepartmentCode);
          console.log("original instructor:", fullInstructorName);
          console.log("formatted for RMP:", formattedInstructor);
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
    } else if (event.target.value === 'subjectCode') {
      fetchClassesBySubjectCode(selectedSubjectCode);
    }
  }

  const handleCardClick = (obj: Class) => {
    setSelectedClass(obj);
  }

  const fetchClasses = async (response: any) => {
    let currLeadInstructors: Instructor[] = [];
    const data = response.classes;
    const newClasses = data.map((cls: any) => {
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
      const response = await fetch(`/api/classes/?quarter=20252&title=${encodeURIComponent(name)}&pageSize=100`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      let classes: Class[] = await fetchClasses(data);
      setDisplayedClasses(classes);
    } catch {
      setError(`Failed to load classes for name '${name}'`);
    } finally {
      setLoading(false);
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
      const response = await fetch(`/api/classes?quarter=20252&subjectCode=${encodeURIComponent(subjectCode)}&pageSize=100`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      const classes: Class[] = await fetchClasses(data);
      setDisplayedClasses(classes);
    } catch {
      setError(`Failed to load classes for subjectCode '${subjectCode}'`);
    } finally {
      setLoading(false);
    }
  };

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
      )
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
              <MenuItem key={subjectCode} value={subjectCode}>{subjectCode}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )
    }
    return null;
  }

  const filteredClassesGrid = () => {
    if (displayedClasses.length === 0) {
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
            style={{ cursor: 'pointer', border: selectedClass.courseId === classObj.courseId ? '2px solid blue' : 'none' }}
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
          <p>Instructor: {selectedClass.courseDetails[0].instructor.name}</p>
          {professorData.length > 0 && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-bold mb-2">Professor Ratings</h3>
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
      isJoined = user.joinedClasses.some((cls) => cls === selectedClass.courseId);
    }

    const joinButton = (
      <Button
        onClick={async () => {
          if (user) {
            try {
              const userRef = doc(db, "users", userId);
              const userDoc = await getDoc(userRef);
              console.log(userDoc);
              if (userDoc.exists()) {
                console.log("User exists");
                await updateDoc(userRef, {
                  joinedClasses: arrayUnion(selectedClass.courseId)
                });
              } else {
                await setDoc(userRef, {
                  joinedClasses: [selectedClass.courseId]
                });
              }
    
              setUser({
                ...user,
                joinedClasses: [...user.joinedClasses, selectedClass.courseId]
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
    )

    const leaveButton = (
      <Button
        onClick={async () => {
          if (user) {
            try {
              const userRef = doc(db, "users", userId);
              const userDoc = await getDoc(userRef);
    
              if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData && userData.joinedClasses) {
                  await updateDoc(userRef, {
                    joinedClasses: arrayRemove(selectedClass.courseId)
                  });
                } else {
                  console.log("No joinedClasses field to remove from");
                }
    
                setUser({
                  ...user,
                  joinedClasses: user.joinedClasses.filter((cls) => cls !== selectedClass.courseId)
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
    )

    return (
      <div>
        {info}
        <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
          <Box mr={2}>{joinButton}</Box>
          <Box>{leaveButton}</Box>
        </Box>
      </div>
    );
  }

  const test = () => {
    if (!user) {
      return <p>No user found</p>
    }
    return <p>{user.name}</p>
  }

  return (
    <div className="flex flex-row items-stretch justify-center min-h-screen w-screen bg-gray-50">
      {/* left panel */}
      <div className="flex flex-col flex-1 p-8 space-y-8 bg-white rounded-lg shadow-md m-4 min-h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Explore Classes</h1>
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
      <div className="flex flex-col flex-1 p-8 space-y-8 bg-white rounded-lg shadow-md m-4 min-h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Class Info</h1>
          <p className="mt-2 text-gray-600">Basic class information</p>
        </div>
        <div className="flex-grow flex flex-col justify-between overflow-auto text-gray-600">
          {classInfo()}
        </div>
        <div>
          {test()}  
        </div>
      </div>
    </div>
  );
}
