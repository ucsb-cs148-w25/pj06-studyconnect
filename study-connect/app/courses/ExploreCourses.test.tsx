import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExploreCourses from './page';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const mockUser = {
    uid: '123',
    email: 'test@example.com',
    name: 'Test User',
    joinedClasses: ['TEST123A'],
};

const mockClass = {
    courseId: 'TEST123A',
    courseTitle: 'Test Class',
    courseDescription: 'This is a test class',
    courseDetails: [
        {
            instructor: { name: 'Test Instructor', functionCode: 'Teaching and in charge' },
            timeLocation: [
                {
                    room: '101',
                    building: 'Test Building',
                    roomCapacity: 30,
                    days: 'MWF',
                    beginTime: '10:00',
                    endTime: '11:00',
                },
            ],
        },
    ],
};

// Mock Firebase functions
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}));

jest.mock('firebase/firestore', () => {
  const actualFirestore = jest.requireActual('firebase/firestore');
  return {
    ...actualFirestore,
    getFirestore: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    arrayUnion: jest.fn(),
    arrayRemove: jest.fn(),
  };
});

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    query: {},
    pathname: '/',
    asPath: '/',
  })),
}));

// Mock Firebase functions
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    onAuthStateChanged: jest.fn(),
    signInWithPopup: jest.fn(),
    GoogleAuthProvider: jest.fn(),
}));

jest.mock('firebase/firestore', () => {
    const actualFirestore = jest.requireActual('firebase/firestore');
    return {
        ...actualFirestore,
        getFirestore: jest.fn(),
        doc: jest.fn(),
        getDoc: jest.fn(),
        setDoc: jest.fn(),
        updateDoc: jest.fn(),
        arrayUnion: jest.fn(),
        arrayRemove: jest.fn(),
    };
});

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn(),
        query: {},
        pathname: '/',
        asPath: '/',
    })),
}));

describe('ExploreCourses Component', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
            callback(mockUser);
            return () => {};
        });
        (getDoc as jest.Mock).mockResolvedValue({
            exists: () => true,
            data: () => mockUser,
        });
    });

    test('renders ExploreCourses component', async () => {
        await act(async () => {
            render(<ExploreCourses />);
        });
        expect(screen.getByText('Explore Classes for')).toBeInTheDocument();
        expect(screen.getByText('Search for classes to join')).toBeInTheDocument();
    });

});