'use client'
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  classId: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export default function PostPage({ params }: { params: Promise<{ postId: string }> }) {
  const resolvedParams = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${resolvedParams.postId}`);
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
  }, [resolvedParams.postId]);

  const formatDate = (timestamp: Post['createdAt']) => {
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
    <div className="max-w-4xl mx-auto p-6">
      <Link
        href={`/?classId=${post.classId}`}
        className="text-blue-500 hover:underline mb-6 block"
      >
        ← Back to Class Forum
      </Link>
      
      <article className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
        
        <div className="text-sm text-gray-500 mb-6">
          Posted by {post.authorName} • {formatDate(post.createdAt)}
        </div>
        
        <div className="prose max-w-none">
          <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
        </div>
      </article>
    </div>
  );
}