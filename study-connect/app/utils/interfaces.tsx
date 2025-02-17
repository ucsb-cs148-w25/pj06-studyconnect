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
    courseDetails: {
      instructor: Instructor; // if 2 instructors, joined by &
      timeLocation: TimeLocation[];
    }[]
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