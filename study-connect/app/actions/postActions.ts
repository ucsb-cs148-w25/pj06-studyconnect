'use server'

import { db } from '../../lib/firebase-admin';
import { cookies } from 'next/headers';
import { Timestamp } from 'firebase-admin/firestore';
import { auth } from 'firebase-admin';
import { randomUUID } from 'crypto';
import { v2 as cloudinary } from 'cloudinary';

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
      const classQuarter = formData.get('classQuarter') as string;
      const images = formData.getAll('images') as string[];

      console.log('Creating post with data:', { title, content, classId, classQuarter }); // Debug log

      if (!title || !content || !classId || !classQuarter) {
        return { error: 'Missing required fields' };
      }

      // Get user data from Firestore
      const userDoc = await db.collection('users').doc(decodedClaim.uid).get();
      const userData = userDoc.data();

      if (!userData) {
        return { error: 'User data not found' };
      }

      const classId_Quarter = classId.trim() + '_' + classQuarter.trim();

      const postData = {
        title,
        content,
        imagesRef: [] as string[],
        classId: classId_Quarter,
        authorId: decodedClaim.uid,
        authorName: userData.name || 'Anonymous',
        createdAt: Timestamp.now(),
      };

      cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_NAME, 
        secure: false,
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      for(const image of images) {
        const imageRef = randomUUID();

        const { secure_url } = await cloudinary.uploader.upload(image, { use_filename: true, public_id: imageRef, folder: "study-connect-posts"});
        postData.imagesRef.push(secure_url);
      }

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