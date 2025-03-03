'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createPost } from '../actions/postActions';
import { QUARTERMAP } from '../utils/consts';

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
  likes: number;
  likedBy: string[];
}

interface ClassForumProps {
  selectedClassId: string;
  selectedClassQuarter: string;
  onCloseAction: () => void;
}

export default function ClassForum({ selectedClassId, selectedClassQuarter, onCloseAction }: ClassForumProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchPostsData = async () => {
    setLoading(true);
    try {
      console.log('classId:', selectedClassId); // Debug log
      console.log(`&classQuarter=${selectedClassQuarter ? selectedClassQuarter : "no quarter found"}`);
      const response = await fetch(`/api/posts?classId=${selectedClassId}&classQuarter=${selectedClassQuarter ? selectedClassQuarter : "20251"}`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      console.log('Fetched posts data:', data); // Debug log
      
      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        console.error('Unexpected response format:', data);
        setError('Unexpected response format');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClassId && selectedClassQuarter) {
      fetchPostsData();
    }
  }, [selectedClassId, selectedClassQuarter]);

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

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Class Forum - {selectedClassId} {selectedClassQuarter && QUARTERMAP[selectedClassQuarter[selectedClassQuarter.length - 1] as keyof typeof QUARTERMAP]} {selectedClassQuarter && selectedClassQuarter.substring(0, 4)}</h2>
        <button
          onClick={onCloseAction}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close forum"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* New Post Form */}
      <form 
        action={async (formData) => {
          try {
            const result = await createPost(formData);
            if (result && result.error) {
              setError(result.error);
            } else {
              setError(null);
              // Clear form fields
              const form = document.querySelector('form') as HTMLFormElement;
              if (form) form.reset();
              // Fetch posts again to show the new post
              await fetchPostsData();
            }
          } catch (err) {
            setError('An error occurred while creating the post');
            console.error(err);
          }
        }}
        className="mb-8 space-y-4"
      >
        <input type="hidden" name="classId" value={selectedClassId} />
        <input type="hidden" name="classQuarter" value={selectedClassQuarter} />
        
        <div>
          <input
            type="text"
            name="title"
            placeholder="Post Title"
            className="w-full p-2 border rounded-md text-black placeholder-gray-500"
            required
          />
        </div>
        
        <div>
          <textarea
            name="content"
            placeholder="Write your post..."
            className="w-full p-2 border rounded-md h-24 text-black placeholder-gray-500"
            required
          />
        </div>
        
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Post
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-center mb-4">{error}</div>
      )}

      {/* Posts List */}
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center text-gray-600">No posts yet. Be the first to post!</div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <Link href={`/posts/${post.id}`}>
                <h3 className="text-xl font-semibold mb-2 text-black hover:text-blue-600">
                  {post.title}
                </h3>
                <p className="text-black mb-4">{post.content}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div>
                    Posted by {post.authorName} • {formatDate(post.createdAt)}
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="currentColor"
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
                    <span>{post.likes || 0}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}