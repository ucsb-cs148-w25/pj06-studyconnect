'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPost } from '../actions/postActions';

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

interface ClassForumProps {
  selectedClassId: string;
  setSelectedClassId: (classId: string | null) => void;
}

export default function ClassForum({ selectedClassId, setSelectedClassId }: ClassForumProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/posts?classId=${selectedClassId}`);
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
    if (selectedClassId) {
      fetchPosts();
    }
  }, [selectedClassId]);

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
        <h2 className="text-2xl font-bold text-black">Class Forum - {selectedClassId}</h2>
        <button 
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-400 transition"
          onClick={() => setSelectedClassId(null)}
        >
          ← Back to Home
        </button>
      </div>
      {/* New Post Form */}
      <form 
        action={async (formData) => {
          try {
            const result = await createPost(formData);
            if (result.error) {
              setError(result.error);
            } else {
              setError(null);
              // Clear form fields
              const form = document.querySelector('form') as HTMLFormElement;
              if (form) form.reset();
              // Fetch posts again to show the new post
              await fetchPosts();
            }
          } catch (err) {
            setError('An error occurred while creating the post');
            console.error(err);
          }
        }}
        className="mb-8 space-y-4"
      >
        <input type="hidden" name="classId" value={selectedClassId} />
        
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
            <div key={post.id} className="border rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-2 text-black">{post.title}</h3>
              <p className="text-black mb-4">{post.content}</p>
              <div className="text-sm text-gray-500">
                Posted by {post.authorName} • {formatDate(post.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}