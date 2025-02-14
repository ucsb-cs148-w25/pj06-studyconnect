'use server'

import { db } from '../../lib/firebase-admin';
import { cookies } from 'next/headers';
import { Timestamp } from 'firebase-admin/firestore';
import { auth } from 'firebase-admin';

export async function createPost(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    
    if (!sessionCookie) {
      return { error: 'You must be signed in to create a post' };
    }

    try {
      const decodedClaim = await auth().verifySessionCookie(sessionCookie, true);
      
      const title = formData.get('title') as string;
      const content = formData.get('content') as string;
      const classId = formData.get('classId') as string;

      console.log('Creating post with data:', { title, content, classId }); // Debug log

      if (!title || !content || !classId) {
        return { error: 'Missing required fields' };
      }

      // Get user data from Firestore
      const userDoc = await db.collection('users').doc(decodedClaim.uid).get();
      const userData = userDoc.data();

      if (!userData) {
        return { error: 'User data not found' };
      }

      const postData = {
        title,
        content,
        classId: classId.trim(), // Ensure consistent classId format
        authorId: decodedClaim.uid,
        authorName: userData.name || 'Anonymous',
        createdAt: Timestamp.now(),
      };

      console.log('Saving post data:', postData); // Debug log

      const docRef = await db.collection('posts').add(postData);
      console.log('Post created with ID:', docRef.id); // Debug log

      return { success: true };
    } catch (error) {
      console.error('Session verification failed:', error);
      return { error: 'Invalid session' };
    }
  } catch (error) {
    console.error('Error creating post:', error);
    return { error: 'Failed to create post' };
  }
}

export const fetchPosts = async (classId: string) => {
  const response = await fetch(`/api/posts?classId=${classId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  const data = await response.json();
  return data;
};