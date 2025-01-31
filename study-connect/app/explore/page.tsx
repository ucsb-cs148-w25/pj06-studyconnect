'use client';
import Image from "next/image";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { 
  Select, MenuItem, InputLabel, FormControl, TextField, SelectChangeEvent,
  Card, CardContent, Typography, Box
} from '@mui/material';

class Class {
  name: string;
  description: string;
  students: number;
  professor: string;
  major: string;

  constructor(name: string, description: string, students: number, professor: string, major: string) {
    this.name = name;
    this.description = description;
    this.students = students;
    this.professor = professor;
    this.major = major;
  }
}

export default function Home() {
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<User | null>(null); // Replace `any` with `User | null`
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  

  const defaultClass = new Class('No Class', '', 0, '', '');

  const [selectedMajor, setSelectedMajor] = useState<string>('');
  const [selectedName, setSelectedName] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<Class>(defaultClass);
  const [selectedSearchType, setSelectedSearchType] = useState<string>('name');

  const mockClassesValues = [
    {
      "name": "CMPSC 130A",
      "description": "Data Structures and Algorithms",
      "students": 20,
      "professor": "Vigoda",
      "major": "CMPSC"
    },
    {
      "name": "CMPSC 130B",
      "description": "Advanced Data Structures and Algorithms",
      "students": 10,
      "professor": "Vigoda",
      "major": "CMPSC"
    },
    {
      "name": "CMPSC 178",
      "description": "Intro to Cryptography",
      "students": 15,
      "professor": "Idk lol",
      "major": "CMPSC"
    },
    {
      "name": "CMPSC 140",
      "description": "Parallel Scientific Computing",
      "students": 25,
      "professor": "john doe",
      "major": "CMPSC"
    },
    {
      "name": "CMPSC 64",
      "description": "Intro to Computer Organization",
      "students": 12,
      "professor": "Vigoda",
      "major": "CMPSC"
    },
    {
      "name": "CHEM 1A",
      "description": "General Chemistry",
      "students": 30,
      "professor": "Vigoda",
      "major": "CHEM"
    },
    {
      "name": "CHEM 1B",
      "description": "General Chemistry",
      "students": 30,
      "professor": "Vigoda",
      "major": "CHEM"
    },
    {
      "name": "CHEM 109A",
      "description": "Physical Chemistry",
      "students": 30,
      "professor": "Vigoda",
      "major": "CHEM"
    },
    {
      "name": "CHEM 109B",
      "description": "Physical Chemistry",
      "students": 30,
      "professor": "Vigoda",
      "major": "CHEM"
    },
    {
      "name": "CHEM 1C",
      "description": "General Chemistry",
      "students": 30,
      "professor": "Idk lol",
      "major": "CHEM"
    },
    {
      "name": "PHYS 1",
      "description": "Physics",
      "students": 30,
      "professor": "Vigoda",
      "major": "PHYS"
    },
    {
      "name": "PHYS 2",
      "description": "Physics",
      "students": 30,
      "professor": "Bowser",
      "major": "PHYS"
    }
  ]

  const mockClasses = mockClassesValues.map((classObj) => new Class(classObj.name, classObj.description, classObj.students, classObj.professor, classObj.major));

  const majors = Array.from(new Set(mockClasses.map((classObj) => classObj.major)));

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
  }

  const handleSelectedMajorChange = (event: SelectChangeEvent<string>) => {
    setSelectedMajor(event.target.value);
  }

  const handleSearchTypeChange = (event: SelectChangeEvent<string>) => {
    setSelectedSearchType(event.target.value);
  }

  const handleCardClick = (obj: Class) => {
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
      )
    } else if (selectedSearchType === 'major') {
      return (
        <FormControl fullWidth margin="none">
          <InputLabel id="searchType-label">Major</InputLabel>
          <Select
              labelId="searchMajor-label"
              id="searchMajor"
              label="Major"
              onChange={handleSelectedMajorChange}
              value={selectedMajor}
              margin="none"
          >
            {majors.map((major) => (
              <MenuItem key={major} value={major}>{major}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )
    }
    return null;
  }

  const filteredClasses = () => {
    return mockClasses.filter((classObj) => {
      if (selectedSearchType === 'name') {
        if (selectedName.trim() === '') { // return nothing if empty
          return false;
        }
        return (
          classObj.name.toLowerCase().includes(selectedName.toLowerCase()) ||
          classObj.description.toLowerCase().includes(selectedName.toLowerCase())
        );
      } else if (selectedSearchType === 'major') {
        return classObj.major === selectedMajor;
      }
      return false;
    });
  };

  const filteredClassesGrid = () => {
    return (
      <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={2} style={{ marginTop: 20 }}>
        {filteredClasses().map((classObj) => (
          <Card
            key={classObj.name}
            onClick={() => handleCardClick(classObj)}
            style={{ cursor: 'pointer', border: selectedClass.name === classObj.name ? '2px solid blue' : 'none' }}
          >
            <CardContent>
              <Typography variant="h5" component="div">
                {classObj.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {classObj.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };

  const classInfo = () => {
    if (selectedClass.name === 'No Class') {
      return null;
    }
    return (
      <div>
        <p>Class Name: {selectedClass.name}</p>
        <p>Description: {selectedClass.description}</p>
        <p>Students enrolled: {selectedClass.students}</p>
        <p>Professor: {selectedClass.professor}</p>
        <p>Major: {selectedClass.major}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-row items-center justify-center h-screen w-screen bg-gray-50">
      <div className="flex flex-col flex-grow w-full p-8 space-y-8 bg-white rounded-lg shadow-md m-4 h-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Explore Classes</h1>
          <p className="mt-2 text-gray-600">Search for classes to join</p>
        </div>
        <div className="flex-grow flex flex-col justify-between h-full">
          <div style={{ marginBottom: 20 }}>
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
                  <MenuItem value="major">Search Class By Major</MenuItem>
              </Select>
            </FormControl>
            <div style={{ marginTop: 20 }}>
              {searchOption()}
            </div>
            <div style={{ marginTop: 20 }}>
              {filteredClassesGrid()}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col flex-grow w-full p-8 space-y-8 bg-white rounded-lg shadow-md m-4 h-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Class Info</h1>
          <p className="mt-2 text-gray-600">Basic class information</p>
        </div>
        <div className="flex-grow flex flex-col justify-between h-full">
          {classInfo()}
        </div>
      </div>
    </div>
  );
  
}
