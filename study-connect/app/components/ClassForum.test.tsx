import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClassForum from './ClassForum';
import { createPost, fetchPosts } from '../actions/postActions';

// Mock the createPost and fetchPosts functions
jest.mock('../actions/postActions', () => ({
  createPost: jest.fn(),
  fetchPosts: jest.fn(),
}));

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    query: {},
    pathname: '/',
    asPath: '/',
  })),
}));

describe('ClassForum Component', () => {
  const mockPosts = [
    {
      id: '1',
      title: 'First Post',
      content: 'This is the first post',
      authorId: 'user1',
      authorName: 'User One',
      classId: 'class1',
      createdAt: { _seconds: 1620000000, _nanoseconds: 0 },
    },
    {
      id: '2',
      title: 'Second Post',
      content: 'This is the second post',
      authorId: 'user2',
      authorName: 'User Two',
      classId: 'class1',
      createdAt: { _seconds: 1620003600, _nanoseconds: 0 },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders ClassForum component', async () => {
    await act(async () => {
      render(<ClassForum selectedClassId="class1" />);
    });
    expect(screen.getByText('Class Forum - class1')).toBeInTheDocument();
  });

  test('displays posts fetched from API', async () => {
    (fetchPosts as jest.Mock).mockResolvedValue(mockPosts);

    await act(async () => {
      render(<ClassForum selectedClassId="class1" />);
    });
    await waitFor(() => expect(screen.getByText('First Post')).toBeInTheDocument());
    expect(screen.getByText('Second Post')).toBeInTheDocument();
  });

  test('displays error message when fetching posts fails', async () => {
    (fetchPosts as jest.Mock).mockRejectedValue(new Error('Failed to fetch posts'));

    await act(async () => {
      render(<ClassForum selectedClassId="class1" />);
    });
    await waitFor(() => expect(screen.getByText('Failed to load posts')).toBeInTheDocument());
  });

  test('handles form submission and creates a new post', async () => {
    (createPost as jest.Mock).mockResolvedValue({ error: null });
    (fetchPosts as jest.Mock).mockResolvedValue(mockPosts);

    await act(async () => {
      render(<ClassForum selectedClassId="class1" />);
    });

    fireEvent.change(screen.getByPlaceholderText('Post Title'), { target: { value: 'New Post' } });
    fireEvent.change(screen.getByPlaceholderText('Write your post...'), { target: { value: 'This is a new post' } });
    fireEvent.click(screen.getByText('Post'));

    await waitFor(() => expect(createPost).toHaveBeenCalledWith(expect.anything()));
    await waitFor(() => expect(fetchPosts).toHaveBeenCalled());
  });

  test('displays error message when creating a post fails', async () => {
    (createPost as jest.Mock).mockResolvedValue({ error: 'Failed to create post' });

    await act(async () => {
      render(<ClassForum selectedClassId="class1" />);
    });

    fireEvent.change(screen.getByPlaceholderText('Post Title'), { target: { value: 'New Post' } });
    fireEvent.change(screen.getByPlaceholderText('Write your post...'), { target: { value: 'This is a new post' } });
    fireEvent.click(screen.getByText('Post'));

    await waitFor(() => expect(screen.getByText('Failed to create post')).toBeInTheDocument());
  });
});