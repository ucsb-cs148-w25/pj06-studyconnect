'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '../../../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  classId: string;
  comments: Comment[];
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  likes: number;
  likedBy: string[];
}

export default function PostPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = use(params); // ✅ Unwraps `params` before accessing `postId`

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }
        const data = await response.json();
        setPost(data);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);


  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          authorId: user.uid,
          authorName: user.displayName || 'Anonymous',
        }),
      });

      if (!response.ok) throw new Error('Failed to post comment');

      const newCommentData = await response.json();
      setPost(prev => prev ? {
        ...prev,
        comments: [newCommentData, ...prev.comments]
      } : null);
      setNewComment('');
    } catch (err) {
      console.error('Error posting comment:', err);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
        }),
      });

      if (!response.ok) throw new Error('Failed to update like');

      const data = await response.json();
      setPost(prev => prev ? {
        ...prev,
        likes: data.likes,
        likedBy: data.likedBy
      } : null);
    } catch (err) {
      console.error('Error updating like:', err);
      alert('Failed to update like. Please try again.');
    }
  };

  const formatDate = (timestamp: { _seconds: number; _nanoseconds: number }) => {
    if (!timestamp) return '';
    const date = new Date(timestamp._seconds * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error || 'Post not found'}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href={`/?classId=${post.classId}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>
        
        <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
              {/* Change author name to a clickable link to author profile */}
              <a href={`/profile/${post.authorId}`} className="font-medium text-gray-900 hover:underline">{post.authorName}</a> 
              <span>•</span>
              <time dateTime={new Date(post.createdAt._seconds * 1000).toISOString()}>
                {formatDate(post.createdAt)}
              </time>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            <div className="mt-6 flex items-center space-x-4">
              <button
                onClick={handleLike}
                disabled={!user}
                className={`flex items-center justify-center space-x-2 px-4 py-2 min-w-[145px] h-10 rounded-md transition-colors ${
                  user && post.likedBy.includes(user.uid)
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 hover:bg-gray-200 text-dark-600'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill={user && post.likedBy.includes(user.uid) ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span>{post.likes} {post.likes === 1 ? 'Like' : 'Likes'}</span>
              </button>
              {!user && (
                <span className="text-sm text-gray-500">
                  Sign in to like this post
                </span>
              )}
              {/* Add count of comments beside the like count */}
              <div
                className={`flex items-center justify-center space-x-2 px-4 py-2 min-w-[145px] h-10 rounded-md transition-colors ${
                  user && post.comments.some(comment => comment.authorId === user.uid)
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-dark-600'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 2.21-1.79 4-4 4H7l-4 4V6c0-2.21 1.79-4 4-4h10c2.21 0 4 1.79 4 4v6z"
                  />
                </svg>
                <span>{post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}</span>
              </div>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments</h2>

            {/* Comment Form */}
            {user && (
              <form onSubmit={handleSubmitComment} className="mb-8">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-md 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    bg-white text-gray-900 placeholder-gray-500"
                  rows={3}
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md 
                    hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {post.comments?.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">{comment.authorName}</span>
                    <span className="text-gray-500 text-sm">•</span>
                    <time className="text-sm text-gray-500" dateTime={new Date(comment.createdAt._seconds * 1000).toISOString()}>
                      {formatDate(comment.createdAt)}
                    </time>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
              
              {post.comments?.length === 0 && (
                <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}