import { NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase-admin';

export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const postId = params.postId;
    const postDoc = await db.collection('posts').doc(postId).get();

    if (!postDoc.exists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const data = postDoc.data();
    const post = {
      id: postDoc.id,
      title: data?.title,
      content: data?.content,
      authorId: data?.authorId,
      authorName: data?.authorName,
      classId: data?.classId,
      createdAt: {
        _seconds: data?.createdAt?._seconds || data?.createdAt?.seconds || 0,
        _nanoseconds: data?.createdAt?._nanoseconds || data?.createdAt?.nanoseconds || 0
      }
    };

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}