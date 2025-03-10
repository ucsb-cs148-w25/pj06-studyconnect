import { useState, useEffect, useRef } from "react";
import { Avatar, Button, Input } from '@mui/material';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc, orderBy, query, addDoc, collection, onSnapshot, Timestamp } from 'firebase/firestore';
import type { Message } from '../utils/interfaces';

function formatTimestamp(timestamp: any): string {
    if (!timestamp) return '';

    // If it's a Firestore Timestamp, convert to Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

    return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit'
    });
}

export default function DirectMessages({ receiverUID }: { receiverUID: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userData, setUserData] = useState<{ name: string; profilePic: string; userId: string } | null>(null);
    const [receiverUserData, setReceiverUserData] = useState<{ name: string; profilePic: string; userId: string } | null>(null);
    const [newMessage, setNewMessage] = useState<string>('');
    const [directMessagesId, setDirectMessagesId] = useState<string | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        // More robust scrolling that works even if the ref isn't visible
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
        
        // Backup method using scrollIntoView
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages]);

    // Fetch sender and receiver user data
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUserData({
                            name: data.name,
                            userId: user.uid,
                            profilePic: data.profilePic || 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg'
                        });

                        const receiverDoc = await getDoc(doc(db, 'users', receiverUID));
                        if (receiverDoc.exists()) {
                            const receiverData = receiverDoc.data();
                            setReceiverUserData({
                                name: receiverData.name,
                                userId: receiverUID,
                                profilePic: receiverData.profilePic || 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg'
                            });
                        }
                    }
                } catch (error) {
                    console.error("Error getting user data:", error);
                }
            }
        });
        return () => unsubscribe();
    }, [receiverUID]);

    useEffect(() => {
        // Check both possible document IDs
        if (!userData || !receiverUID) return;
        const chatDocRef1 = collection(db, 'directMessages', `${userData.userId}_${receiverUID}`, "messages");
        const chatDocRef2 = collection(db, 'directMessages', `${receiverUID}_${userData.userId}`, "messages");

        let chatDocRef = chatDocRef1;
        if (chatDocRef1) {
            chatDocRef = chatDocRef1;
            setDirectMessagesId(`${userData.userId}_${receiverUID}`);
        } else if (chatDocRef2) {
            chatDocRef = chatDocRef2;
            setDirectMessagesId(`${receiverUID}_${userData.userId}`);
        } else {
            // default to one of them if both don't exist
            chatDocRef = chatDocRef1;
            setDirectMessagesId(`${userData.userId}_${receiverUID}`);
        }

        const q = query(
            chatDocRef,
            orderBy('timestamp', 'asc')
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messageList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Message[]
            setMessages(messageList);
            scrollToBottom();
        });

        return () => unsubscribe();
    }, [receiverUID, userData]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !userData || !receiverUserData) return;

        const newMessageData = {
            user: {
                name: userData.name,
                userId: userData.userId,
                avatar: userData.profilePic
            },
            content: newMessage,
            timestamp: Timestamp.now()
        };

        try {
            const chatDocRef1 = collection(db, 'directMessages', `${userData.userId}_${receiverUserData.userId}`, "messages");
            const chatDocRef2 = collection(db, 'directMessages', `${receiverUserData.userId}_${userData.userId}`, "messages");
            
            const chatDoc1 = await getDoc(doc(chatDocRef1));
            const chatDoc2 = await getDoc(doc(chatDocRef2));
        
            let chatDocRef;
            if (chatDoc1.exists()) {
                chatDocRef = chatDocRef1;
                await addDoc(chatDocRef1, newMessageData);
            } else if (chatDoc2.exists()) {
                chatDocRef = chatDocRef2;
                await addDoc(chatDocRef2, newMessageData);
            } else {
                await setDoc(doc(chatDocRef1), newMessageData);
            }
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="flex flex-col h-full mx-auto overflow-hidden">
            <div 
                className="flex-grow p-4 overflow-y-auto"
                ref={messagesContainerRef}
            >
                {messages.map((message) => (
                <div key={message.id} className="flex items-start space-x-4 mb-4">
                    <Avatar src={message.user.avatar} alt={message.user.name} sx={{position:'static'}}>
                        {message.user.name.charAt(0)}
                    </Avatar>
                    <div className="flex-1 space-y-1">
                    <div className="flex items-center">
                        <a href={`/profile/${message.user.userId}`} className="font-semibold text-gray-600 hover:underline">{message.user.name}</a> 
                        <span className="text-xs text-gray-600 text-muted-foreground ml-2">
                        {formatTimestamp(message.timestamp)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600">{message.content}</p>
                    </div>
                </div>
                ))}
                <div ref={messagesEndRef} style={{ height: "1px", width: "100%" }} />
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
    );
}