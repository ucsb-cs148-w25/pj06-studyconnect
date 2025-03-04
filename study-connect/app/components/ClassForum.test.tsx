import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClassForum from './ClassForum';
import { createPost } from '../actions/postActions';

// Mock the createPost function
jest.mock('../actions/postActions', () => ({
  createPost: jest.fn()
}));

const mockPosts = [
  {
    id: '1',
    title: 'First Post',
    content: 'This is the first post',
    authorId: 'user1',
    authorName: 'User One',
    classId: 'class1_20252',
    createdAt: { _seconds: 1620000000, _nanoseconds: 0 },
  },
  {
    id: '2',
    title: 'Second Post',
    content: 'This is the second post',
    authorId: 'user2',
    authorName: 'User Two',
    classId: 'class1_20252',
    createdAt: { _seconds: 1620003600, _nanoseconds: 0 },
  },
]

// Mock the fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockPosts),
  })
) as jest.Mock;

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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders ClassForum component', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPosts),
    });

    await act(async () => {
      render(<ClassForum selectedClassId="class1" selectedClassQuarter="20252" onCloseAction={() => {}} />);
    });

    // Wait for the fetch call to complete
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/posts?classId=class1_20252'));

    // Verify that the component renders the expected text
    expect(screen.getByText('Class Forum - class1 Spring 2025')).toBeInTheDocument();
  });

  test('fetch is mocked properly', async () => {
    const mockResponse = { message: 'Fetch is mocked!' };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const response = await global.fetch('/api/test');
    const data = await response.json();

    // Verify that fetch was called with the correct URL
    expect(global.fetch).toHaveBeenCalledWith('/api/test');

    // Verify that the mock response is returned
    expect(data).toEqual(mockResponse);
  });

  test('displays posts fetched from API', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPosts)
    });

    await act(async () => {
      render(<ClassForum selectedClassId="class1" selectedClassQuarter="20252" onCloseAction={() => {}} />);
    });

    // Wait for the fetch call to complete
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/posts?classId=class1_20252'));

    // TODO Verify that the posts are displayed
    await waitFor(() => expect(screen.getByText('First Post')).toBeInTheDocument());
    expect(screen.getByText('Second Post')).toBeInTheDocument();
  });

  test('displays error message when fetching posts fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Failed to fetch posts'));

    await act(async () => {
      render(<ClassForum selectedClassId="class1" selectedClassQuarter="20252" onCloseAction={() => {}} />);
    });

    // Wait for the fetch call to complete
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/posts?classId=class1_20252'));

    // Verify that the error message is displayed
    await waitFor(() => expect(screen.getByText('Failed to load posts')).toBeInTheDocument());
  });

  test('handles form submission and creates a new post', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPosts),
    });

    await act(async () => {
      render(<ClassForum selectedClassId="class1" selectedClassQuarter="20252" onCloseAction={() => {}} />);
    });

    fireEvent.change(screen.getByPlaceholderText('Post Title'), { target: { value: 'New Post' } });
    fireEvent.change(screen.getByPlaceholderText('Write your post...'), { target: { value: 'This is a new post' } });
    fireEvent.click(screen.getByText('Post'));

    // Wait for the createPost call to complete
    await waitFor(() => expect(createPost).toHaveBeenCalledWith(expect.anything()));
  });

  test('displays error message when creating a post fails', async () => {
    (createPost as jest.Mock).mockResolvedValue({ error: 'Failed to create post' });

    await act(async () => {
      render(<ClassForum selectedClassId="class1" selectedClassQuarter="20252" onCloseAction={() => {}} />);
    });

    fireEvent.change(screen.getByPlaceholderText('Post Title'), { target: { value: 'New Post' } });
    fireEvent.change(screen.getByPlaceholderText('Write your post...'), { target: { value: 'This is a new post' } });
    fireEvent.click(screen.getByText('Post'));

    // Wait for the error message to be displayed
    await waitFor(() => expect(screen.getByText('Failed to create post')).toBeInTheDocument());
  });
});