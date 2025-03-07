'use client'

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User } from '../utils/interfaces';
import Image from 'next/image';
import Link from 'next/link';
/*
const ProfileContent = dynamic(() => import('../components/ProfileContent'), {
    ssr: false,
    loading: () => (
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )
  });
  */
  
  export default function Friends() {
      const [user, setUser] = useState<User | null>(null);
      const [friendsList, setFriendsList] = useState<User[]>([]);
      const [loadingFriends, setLoadingFriends] = useState(false);
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
                  console.log("userData: ", userData);
                  console.log("user.uid in profile page: ", user.uid); 
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
            <div className="flex-1 p-8">
                <div className="flex h-screen">
                <div className="w-2/5 p-4 border-r overflow-y-auto h-full">
                  {friendsList.map(friend => (
                      <Link 
                          href={`/profile/${friend.userId}`} 
                          key={friend.userId}
                          className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                          <Image 
                              src={friend.profilePic} 
                              alt={friend.name}
                              width={50}
                              height={50}
                              className="rounded-full mr-4"
                          />
                          <div>
                              <h3 className="font-medium text-gray-900">{friend.name}</h3>
                              <p className="text-sm text-gray-500">{friend.major}</p>
                          </div>
                      </Link>
                  ))}
                </div>
                <div className="w-3/5 p-4 border-r overflow-y-auto h-full tect-gray-600">
                  WebChat Goes Here, Placeholder Message
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