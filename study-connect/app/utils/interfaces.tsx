export interface User {
    userId: string;
    name: string;
    email: string;
    grade: string;
    major: string;
    minor: string;
    joinedClasses: JoinedClass[];
    profilePic: string;
    aboutMe: string;
    friends: string[]; 
    friendRequests: FriendRequest[]; 
}

export interface Class {
    courseQuarter: string;
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
    courseQuarter: string;
}

export type Professor = {
  id: string;
  firstName: string;
  lastName: string;
  avgRating: number;
  avgDifficulty: number;
  numRatings: number;
  wouldTakeAgainPercent: number;
  commentsSummarizedByGPT: string;
};

export type Message = {
  id: string
  user: {
    name: string
    userId: string
    avatar: string
  }
  content: string
  timestamp: any
  courseId: string
  courseQuarter: string
}

export interface FriendRequest {
    requestId: string;
    fromUserId: string;
    fromUserName: string;
    fromUserProfilePic: string;
    status: 'pending' | 'accepted' | 'rejected';
    timestamp: number;
}