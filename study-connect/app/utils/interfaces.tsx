export interface User {
    name: string;
    email: string;
    grade: string;
    major: string;
    minor: string;
    joinedClasses: string[];
    profilePic: string;
}

export interface Class {
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

export interface Instructor {
    name: string;
    functionCode: string;
}
  
export interface TimeLocation {
    room: string;
    building: string;
    roomCapacity: number;
    days: string;
    beginTime: string;
    endTime: string
    }

export interface JoinedClass {
    courseId: string;
    courseTitle?: string;
}

export interface Professor {
  id: string;
  firstName: string;
  lastName: string;
  avgRating: number;
  avgDifficulty: number;
  numRatings: number;
  wouldTakeAgainPercent: number;
  commentsSummarizedByGPT: string;
};