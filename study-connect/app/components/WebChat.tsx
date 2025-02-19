import type React from "react"

import { useState } from "react"
import { Avatar } from '@mui/material'
import { Button } from '@mui/material'
import { Input } from '@mui/material'

type Message = {
  id: number
  user: {
    name: string
    avatar: string
  }
  content: string
  timestamp: string
}

const initialMessages: Message[] = [
  {
    id: 1,
    user: { name: "Alice", avatar: "/placeholder.svg?height=40&width=40" },
    content: "Hey everyone! How's it going?",
    timestamp: "2:30 PM",
  },
  {
    id: 2,
    user: { name: "Bob", avatar: "/placeholder.svg?height=40&width=40" },
    content: "Hi Alice! All good here. How about you?",
    timestamp: "2:32 PM",
  },
  {
    id: 3,
    user: { name: "Charlie", avatar: "/placeholder.svg?height=40&width=40" },
    content: "Hello folks! Just joined the chat.",
    timestamp: "2:35 PM",
  },
]

export default function WebChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() === "") return

    const message: Message = {
      id: messages.length + 1,
      user: { name: "You", avatar: "/placeholder.svg?height=40&width=40" },
      content: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  return (
    <div className="flex flex-col h-[600px] max-w-md mx-auto border rounded-lg overflow-hidden">
      <div className="bg-primary text-primary-foreground p-4">
        <h2 className="text-xl font-bold">Messages</h2>
      </div>
      <div className="flex-grow p-4">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start space-x-4 mb-4">
            <Avatar>SB</Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center">
                <span className="font-semibold">{message.user.name}</span>
                <span className="text-xs text-muted-foreground ml-2">{message.timestamp}</span>
              </div>
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
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