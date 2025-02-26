import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const postDoc = await db.collection('posts').doc(postId).get();

    if (!postDoc.exists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Fetch comments for this post
    const commentsSnapshot = await db
      .collection('posts')
      .doc(postId)
      .collection('comments')
      .orderBy('createdAt', 'desc')
      .get();

    const comments = commentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: {
        _seconds: doc.data().createdAt?._seconds || doc.data().createdAt?.seconds || 0,
        _nanoseconds: doc.data().createdAt?._nanoseconds || doc.data().createdAt?.nanoseconds || 0
      }
    }));

    const data = postDoc.data();
    const post = {
      id: postDoc.id,
      title: data?.title,
      content: data?.content,
      authorId: data?.authorId,
      authorName: data?.authorName,
      classId: data?.classId,
      likes: data?.likes || 0,
      likedBy: data?.likedBy || [],
      createdAt: {
        _seconds: data?.createdAt?._seconds || data?.createdAt?.seconds || 0,
        _nanoseconds: data?.createdAt?._nanoseconds || data?.createdAt?.nanoseconds || 0
      },
      comments: comments // Add comments to the response
    };

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Add POST endpoint for creating new comments
export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const { content, authorId, authorName } = await request.json();

    if (!content || !authorId || !authorName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const commentRef = await db
      .collection('posts')
      .doc(postId)
      .collection('comments')
      .add({
        content,
        authorId,
        authorName,
        createdAt: new Date(),
      });

    const commentDoc = await commentRef.get();
    const commentData = commentDoc.data();

    return NextResponse.json({
      id: commentDoc.id,
      ...commentData,
      createdAt: {
        _seconds: commentData?.createdAt?._seconds || commentData?.createdAt?.seconds || 0,
        _nanoseconds: commentData?.createdAt?._nanoseconds || commentData?.createdAt?.nanoseconds || 0
      }
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add new PUT endpoint for handling likes
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();
    const postData = postDoc.data();

    if (!postDoc.exists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const likedBy = postData?.likedBy || [];
    const isLiked = likedBy.includes(userId);

    // Toggle like
    if (isLiked) {
      await postRef.update({
        likes: (postData?.likes || 0) - 1,
        likedBy: likedBy.filter((id: string) => id !== userId)
      });
    } else {
      await postRef.update({
        likes: (postData?.likes || 0) + 1,
        likedBy: [...likedBy, userId]
      });
    }

    const updatedDoc = await postRef.get();
    const updatedData = updatedDoc.data();

    return NextResponse.json({
      likes: updatedData?.likes || 0,
      likedBy: updatedData?.likedBy || []
    });
  } catch (error) {
    console.error('Error updating likes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}