'use client'

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User } from '../utils/interfaces';
import Image from 'next/image';
import Link from 'next/link';
import DirectMessages from "../components/DirectMessages";
  
  export default function Friends() {
      const [user, setUser] = useState<User | null>(null);
      const [friendsList, setFriendsList] = useState<User[]>([]);
      const [loadingFriends, setLoadingFriends] = useState(false);
      const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
      const router = useRouter();
  
      useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          if (!user) {
              router.push('/');
              return;
          }
  
          try {
              const userDoc = await getDoc(doc(db, 'users', user.uid));
              if (userDoc.exists()) {
                  const userData = userDoc.data();
                  setUser({
                      userId: user.uid || '',
                      name: userData.name || '',
                      email: user.email || '',
                      grade: userData.grade || '',
                      major: userData.major || '',
                      minor: userData.minor || '',
                      joinedClasses: userData.joinedClasses || [],
                      profilePic: userData.profilePic || 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg',
                      aboutMe: userData.aboutMe || '',
                      friends: userData.friends || [],
                      friendRequests: userData.friendRequests || []
                  });
              }
          } catch (error) {
              console.error("Error getting user document: ", error);
          }
        });
  
        return () => unsubscribe();
      }, [router]);
  
      // Fetch friends data when user is loaded
      useEffect(() => {
          if (!user || !user.friends || user.friends.length === 0) {
              setFriendsList([]);
              return;
          }
          
          const fetchFriends = async () => {
              setLoadingFriends(true);
              try {
                  const friendsData: User[] = [];
                  
                  // Fetch each friend's data
                  for (const friendId of user.friends) {
                      const friendDoc = await getDoc(doc(db, 'users', friendId));
                      if (friendDoc.exists()) {
                          const data = friendDoc.data();
                          friendsData.push({
                              userId: friendId,
                              name: data.name || '',
                              email: data.email || '',
                              grade: data.grade || '',
                              major: data.major || '',
                              minor: data.minor || '',
                              joinedClasses: data.joinedClasses || [],
                              profilePic: data.profilePic || 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg',
                              aboutMe: data.aboutMe || '',
                              friends: data.friends || [],
                              friendRequests: data.friendRequests || [],
                          });
                      }
                  }
                  
                  setFriendsList(friendsData);
              } catch (error) {
                  console.error("Error fetching friends: ", error);
              } finally {
                  setLoadingFriends(false);
              }
          };
          
          fetchFriends();
      }, [user]);
  
      const renderFriendsList = () => {
          if (loadingFriends) {
              return (
                  <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
              );
          }
  
          if (friendsList.length === 0) {
              return (
                  <div className="text-center py-8 text-gray-500">
                      You don't have any friends yet. Add some friends to connect!
                  </div>
              );
          }
  
          return (
            <div className="flex-1 bg-gray-50 pt-4">
              {/* Main container with height calculation to account for navbar */}
              <div className="flex h-[calc(100vh-80px)] mx-4">
                {/* Friends list sidebar */}
                <div className="w-2/5 bg-white rounded-l-lg shadow overflow-y-auto">
                  {friendsList.map(friend => (
                    <div key={friend.userId}>
                      <button 
                        className={`flex items-center p-4 w-full my-2 hover:bg-gray-50 transition-colors ${selectedFriend?.userId === friend.userId ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                        onClick={() => setSelectedFriend(friend)}
                      >
                        <div className="flex w-full justify-between items-center">
                          {/* Left side: Profile image, name, and major */}
                          <div className="flex items-center">
                            <Image 
                              src={friend.profilePic} 
                              alt={friend.name}
                              width={50}
                              height={50}
                              className="rounded-full mr-4"
                            />
                            <div className="flex flex-col">
                              <h3 className="font-medium text-gray-900 text-left">{friend.name}</h3>
                              <p className="text-sm text-gray-500 text-left">{friend.major}</p>
                            </div>
                          </div>
                          
                          {/* Right side: View Profile link */}
                          <Link 
                            href={`/profile/${friend.userId}`} 
                            className="ml-auto px-3 py-2 bg-blue-950 text-amber-500 rounded hover:bg-blue-200 transition"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Profile
                          </Link>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Messages panel */}
                <div className="w-3/5 bg-white rounded-r-lg ml-2 shadow overflow-hidden">
                {selectedFriend ? (
                    <DirectMessages 
                      key={`chat-with-${selectedFriend.userId}`}
                      receiverUID={selectedFriend.userId} 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center p-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <p className="text-lg font-medium">Select a friend to start chatting</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
      };
  
      if (!user) {
        return (
          <div className="h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        );
      }
  
      return (
        <Suspense fallback={<div className="h-screen flex justify-center items-center">Loading...</div>}>
          
          {/* Friends List Section */}
          <div className="mt-8 px-8">
              <h2 className="text-2xl font-bold mb-4">Friends ({user.friends.length})</h2>
              {renderFriendsList()}
          </div>
        </Suspense>
      );
  }