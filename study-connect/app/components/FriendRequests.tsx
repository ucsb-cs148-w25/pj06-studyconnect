'use client'
import { useState } from 'react';
import { User, FriendRequest } from '../utils/interfaces';
import { db } from '../../lib/firebase';
import { doc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';

interface FriendRequestsProps {
  currentUser: User;
  onUpdate: () => void;
}

export default function FriendRequests({ currentUser, onUpdate }: FriendRequestsProps) {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  
  const pendingRequests = currentUser.friendRequests?.filter(
    req => req.status === 'pending'
  ) || [];

  const handleAcceptRequest = async (request: FriendRequest) => {
    setIsLoading(prev => ({ ...prev, [request.requestId]: true }));
    
    try {
      // 1. Update the request status
      const updatedRequests = currentUser.friendRequests.map(req => 
        req.requestId === request.requestId ? { ...req, status: 'accepted' } : req
      );
      
      // 2. Add to friends list for both users
      await updateDoc(doc(db, 'users', currentUser.userId), {
        friendRequests: updatedRequests,
        friends: arrayUnion(request.fromUserId)
      });
      
      // 3. Add current user to the requester's friends list
      await updateDoc(doc(db, 'users', request.fromUserId), {
        friends: arrayUnion(currentUser.userId)
      });
      
      onUpdate();
    } catch (error) {
      console.error("Error accepting friend request:", error);
    } finally {
      setIsLoading(prev => ({ ...prev, [request.requestId]: false }));
    }
  };

  const handleRejectRequest = async (request: FriendRequest) => {
    setIsLoading(prev => ({ ...prev, [request.requestId]: true }));
    
    try {
      // Update the request status
      const updatedRequests = currentUser.friendRequests.map(req => 
        req.requestId === request.requestId ? { ...req, status: 'rejected' } : req
      );
      
      await updateDoc(doc(db, 'users', currentUser.userId), {
        friendRequests: updatedRequests
      });
      
      onUpdate();
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    } finally {
      setIsLoading(prev => ({ ...prev, [request.requestId]: false }));
    }
  };

  if (pendingRequests.length === 0) {
    return <div className="text-gray-500">No pending friend requests</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Friend Requests</h3>
      {pendingRequests.map(request => (
        <div key={request.requestId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Image 
              src={request.fromUserProfilePic} 
              alt={request.fromUserName}
              width={40}
              height={40}
              className="rounded-full"
            />
            <Link href={`/profile/${request.fromUserId}`} className="font-medium hover:underline">
              {request.fromUserName}
            </Link>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleAcceptRequest(request)}
              disabled={isLoading[request.requestId]}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
            >
              {isLoading[request.requestId] ? 'Processing...' : 'Accept'}
            </button>
            <button
              onClick={() => handleRejectRequest(request)}
              disabled={isLoading[request.requestId]}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
            >
              {isLoading[request.requestId] ? 'Processing...' : 'Reject'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 