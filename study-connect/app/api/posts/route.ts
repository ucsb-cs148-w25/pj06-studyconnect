import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase-admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    const postsSnapshot = await db
      .collection('posts')
      .where('classId', '==', classId)
      .orderBy('createdAt', 'desc')
      .get();

    const posts = postsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        content: data.content,
        authorId: data.authorId,
        authorName: data.authorName,
        classId: data.classId,
        createdAt: {
          _seconds: data.createdAt._seconds || data.createdAt.seconds || 0,
          _nanoseconds: data.createdAt._nanoseconds || data.createdAt.nanoseconds || 0
        },
        likes: data.likes || 0,
        likedBy: data.likedBy || []
      };
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}