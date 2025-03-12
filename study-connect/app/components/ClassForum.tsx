'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createPost } from '../actions/postActions';

interface Post {
  id: string;
  title: string;
  content: string;
  imagesRef: string[];
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
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  
  const imageReader = new FileReader();

  imageReader.onload = () => {
    setImagePreviews([...imagePreviews, imageReader.result as string]);
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const image = e.target.files?.item(0);
    if(image) {
      setUploadedImages([...uploadedImages, image]);
      imageReader.readAsDataURL(image);
    }
  }

  const handelImageRemove = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    const imageId = parseInt(e.currentTarget.getAttribute("image-id") as string, 10);
    setImagePreviews(imagePreviews.filter((e, i) => i !== imageId));
    setUploadedImages(uploadedImages.filter((e, i) => i !== imageId));
  };

  const fetchPostsData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/posts?classId=${selectedClassId}&classQuarter=${selectedClassQuarter}`);
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
      fetchPostsData();
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
        <h2 className="text-2xl font-bold text-black">{selectedClassId} - {
          // selectedClassQuarter && QUARTERMAP[selectedClassQuarter[selectedClassQuarter.length - 1] as keyof typeof QUARTERMAP]} {selectedClassQuarter && selectedClassQuarter.substring(0, 4)
        } Forums</h2>
        <div className="flex justify-between items-center space-x-4">
          <button
            className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            // onClick={handleInfoClick}
          >
            Info
          </button>
          <button
            className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            // onClick={handleMembersClick}
          >
            Members
          </button>
        </div>
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
            // uploadedImages.forEach(file => formData.append("images", file));
            imagePreviews.forEach(image => formData.append("images", image));

            console.log(formData.keys().toArray());
            formData.set("classQuarter", selectedClassQuarter);

            const result = await createPost(formData);

            console.log(result.error)

            if (result && result.error) {
              setError(result.error);
            } else {
              setError(null);
              // Clear form fields
              const form = document.querySelector('form') as HTMLFormElement;
              if (form) form.reset();
              // Fetch posts again to show the new post
              setImagePreviews([]);
              setUploadedImages([]);
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
          <div className="relative">
          <textarea
            name="content"
            placeholder="Write your post..."
            className="w-full p-2 border rounded-md h-24 text-black placeholder-gray-500"
            required
          />

          <input
            className="hidden"
            type="file"
            id="form-image"
            accept="image/*"
            onChange={handleImageUpload} 
          />
          <label
            className="
              absolute right-4 bottom-4
              w-12 h-12 px-4 py-2 rounded-full 
              flex items-center justify-center 
              cursor-pointer 
              bg-blue-500 text-white hover:bg-blue-600 transition
              "
            htmlFor="form-image"
          >
            <img width={24} height={24} src="/image-regular.svg" alt="add image" />
          </label>
          </div>
          <div>
            {
              imagePreviews.map((imageURL, i) => (
                <div className='relative'>
                  <span
                  className='
                    absolute top-4 right-4
                    w-8 h-8 rounded-full
                    flex items-center justify-center select-none
                    cursor-pointer
                    bg-black opacity-40 text-white hover:opacity-60 transition
                  '
                  onClick={handelImageRemove}
                  image-id={i}
                  >x</span>
                  <img className='select-none' src={imageURL} />
                </div>
              ))
            }
          </div>
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
                <div>
                  {post.imagesRef.map((imageRef, i) => {
                    return (
                      <div id={`post-${post.id}-image-${i}`}>
                        <img src={imageRef} />
                      </div>
                    );
                    })}
                </div>
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