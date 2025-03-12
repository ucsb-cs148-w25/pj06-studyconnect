import { useState, useEffect, useRef } from "react";
import { Avatar, Button, Input } from '@mui/material';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, Timestamp } from 'firebase/firestore';
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
    const [chatDocId, setChatDocId] = useState<string | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ 
            behavior: "smooth"
        });
    };

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(scrollToBottom, 300);
        }
    }, [messages]);

    // Separate the auth listener and chat document listener
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

    // Separate effect for chat document listener
    useEffect(() => {
        if (!userData || !receiverUID) return;
        
        let unsubscribeMessages: () => void = () => {};

        const getOrCreateChatDoc = async () => {
            // Check both possible document IDs
            const id1 = `${userData.userId}_${receiverUID}`;
            const id2 = `${receiverUID}_${userData.userId}`;
            
            const doc1 = await getDoc(doc(db, 'directMessages', id1));
            const doc2 = await getDoc(doc(db, 'directMessages', id2));
            
            if (doc1.exists()) {
                setChatDocId(id1);
                return id1;
            } else if (doc2.exists()) {
                setChatDocId(id2);
                return id2;
            } else {
                await setDoc(doc(db, 'directMessages', id1), {
                    messages: []
                });
                setChatDocId(id1);
                return id1;
            }
        };

        getOrCreateChatDoc().then(chatId => {
            if (chatId === chatDocId) return;
            unsubscribeMessages = onSnapshot(doc(db, 'directMessages', chatId), (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();setMessages(data.messages || []);
                } else {
                    setMessages([]);
                }
            });
        });

        return () => {
            unsubscribeMessages();
        };
    }, [userData, receiverUID]);
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !userData || !receiverUserData || !chatDocId) return;

        const newMessageData = {
            id: `${Date.now()}_${userData.userId}`,
            user: {
                name: userData.name,
                userId: userData.userId,
                avatar: userData.profilePic
            },
            content: newMessage,
            timestamp: Timestamp.now()
        };

        try {
            const chatDocRef = doc(db, 'directMessages', chatDocId);
            const chatDoc = await getDoc(chatDocRef);
            
            if (chatDoc.exists()) {
                const currentMessages = chatDoc.data().messages || [];
                await updateDoc(chatDocRef, {
                    messages: [...currentMessages, newMessageData]
                });
            } else {
                await setDoc(chatDocRef, {
                    messages: [newMessageData]
                });
            }
            
            setNewMessage("");
            scrollToBottom();
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
                {messages.length > 0 ? (messages.map((message) => (
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
                ))) : (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-gray-500">No messages yet. Start a conversation!</p>
                    </div>
                )}
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