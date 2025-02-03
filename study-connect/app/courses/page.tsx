'use client';
import Image from "next/image";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { SUBJECTCODES } from "../classes/page";

import { 
  Select, MenuItem, InputLabel, FormControl, TextField, SelectChangeEvent,
  Card, CardContent, Typography, Box, Button
} from '@mui/material';

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

export default function Home() {
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<User | null>(null); // Replace `any` with `User | null`
  const [loading, setLoading] = useState(true);
  const router = useRouter();



  const defaultClass: Class = {
    courseId: 'No Class',
    courseTitle: '',
    courseDescription: '',
    courseDetails: []
  };

  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('');
  const [selectedName, setSelectedName] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<Class>(defaultClass);
  const [selectedSearchType, setSelectedSearchType] = useState<string>('name');

  const [classesLoading, setClassesLoading] = useState<boolean>(false);
  const [classesError, setClassesError] = useState<boolean>(false);

  const [joinedClasses, setJoinedClasses] = useState<Class[]>([]);

  const [displayedClasses, setDisplayedClasses] = useState<Class[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
    console.log(data);
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
      console.log(response);
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
        </div>
      );
    }
    const isJoined = joinedClasses.some((cls) => cls.courseId === selectedClass.courseId);
    const joinButton = (
      <Button
        onClick={() => {
          setJoinedClasses([...joinedClasses, selectedClass]);
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
        onClick={() => {
          setJoinedClasses(joinedClasses.filter((cls) => cls.courseId !== selectedClass.courseId));
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
      </div>
    </div>
  );
  
  
}
