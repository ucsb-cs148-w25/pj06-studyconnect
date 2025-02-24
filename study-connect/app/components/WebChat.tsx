import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Avatar, Button, Input } from '@mui/material'
import { db, auth } from '@/lib/firebase'
import { collection, addDoc, onSnapshot, query, orderBy, doc, getDoc, serverTimestamp } from 'firebase/firestore'

type Message = {
  id: string
  user: {
    name: string
    avatar: string
  }
  content: string
  timestamp: any
  classId: string
}
//placeholder messages just for the sake of showing the UI, these will be deleted
const initialMessages: Message[] = [
  {
    id: "1",
    user: { name: "Alice", avatar: "/placeholder.svg?height=40&width=40" },
    content: "Hey everyone! How's it going?",
    timestamp: "2:30 PM",
    classId: "class1"
  },
  {
    id: "2",
    user: { name: "Bob", avatar: "/placeholder.svg?height=40&width=40" },
    content: "Hi Alice! All good here. How about you?",
    timestamp: "2:32 PM",
    classId: "class1"
  },
  {
    id: "3",
    user: { name: "Charlie", avatar: "/placeholder.svg?height=40&width=40" },
    content: "Hello folks! Just joined the chat.",
    timestamp: "2:35 PM",
    classId: "class1"
  },
]

interface WebChatProps {
  selectedClassId: string;
}

function formatTimestamp(timestamp: any): string {
  if (!timestamp) return '';
  
  // If it's a Firestore Timestamp, convert to Date
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit'
  });
}

export default function WebChat({ selectedClassId }: WebChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [userData, setUserData] = useState<{ name: string; profilePic: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Fetch user data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              name: data.name || 'Anonymous',
              profilePic: data.profilePic || 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg'
            });
          }
        } catch (error) {
          console.error("Error getting user data:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const classMessagesRef = collection(db, 'classes', selectedClassId, 'messages')
    const q = query(
      classMessagesRef,
      orderBy('timestamp', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[]
      setMessages(messageList)
      scrollToBottom()
    })

    return () => unsubscribe()
  }, [selectedClassId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() === "" || !userData) return

    try {
      const classMessagesRef = collection(db, 'classes', selectedClassId, 'messages')
      
      await addDoc(classMessagesRef, {
        user: {
          name: userData.name,
          avatar: userData.profilePic
        },
        content: newMessage.trim(),
        timestamp: serverTimestamp(),
        classId: selectedClassId
      })
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  return (
    <div className="flex flex-col h-[600px] max-w-md mx-auto border rounded-lg overflow-hidden">
      <div className="bg-primary text-primary-foreground p-4">
        <h2 className="text-xl text-black font-bold">Class Chat</h2>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start space-x-4 mb-4">
            <Avatar src={message.user.avatar} alt={message.user.name}>
              {message.user.name.charAt(0)}
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center">
                <span className="font-semibold text-gray-600">{message.user.name}</span>
                <span className="text-xs text-gray-600 text-muted-foreground ml-2">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-600">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit">Send</Button>
        </div>
      </form>
    </div>
  )
}
