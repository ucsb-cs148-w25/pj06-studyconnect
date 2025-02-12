import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase-admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    const cleanClassId = classId.trim();
    console.log('Querying for classId:', cleanClassId); // Debug log

    const postsRef = db.collection('posts');
    const q = postsRef.where('classId', '==', cleanClassId);

    console.log('Executing query...'); // Debug log
    const snapshot = await q.get();
    console.log('Query snapshot size:', snapshot.size); // Debug log
    console.log('Query snapshot empty:', snapshot.empty); // Debug log

    // Log raw data from Firestore
    snapshot.docs.forEach(doc => {
      console.log('Document data:', {
        id: doc.id,
        data: doc.data()
      });
    });

    const posts = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Processing document:', data); // Debug log
      
      return {
        id: doc.id,
        title: data.title,
        content: data.content,
        authorId: data.authorId,
        authorName: data.authorName,
        classId: data.classId,
        createdAt: {
          _seconds: data.createdAt?._seconds || data.createdAt?.seconds || 0,
          _nanoseconds: data.createdAt?._nanoseconds || data.createdAt?.nanoseconds || 0
        }
      };
    });

    console.log('Final posts array:', posts); // Debug log
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch posts';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}