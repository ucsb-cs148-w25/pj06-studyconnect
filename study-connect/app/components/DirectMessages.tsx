import { useState, useEffect, useRef } from "react";
import { Avatar, Button, Input } from '@mui/material';
import { db, auth } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { Message } from '../utils/interfaces';

interface Chat {
    senderUID: string;
    receiverUID: string;
    messages: Message;
}

export default function DirectMessages({ receiverUID }: { receiverUID: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [senderUserData, setSenderUserData] = useState<{ name: string; profilePic: string; userId: string }>();
    const [receiverUserData, setReceiverUserData] = useState<{ name: string; profilePic: string; userId: string }>();
    const [newMessage, setNewMessage] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch sender and receiver user data
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const senderUserDoc = await getDoc(doc(db, 'users', user.uid));
                    if (senderUserDoc.exists()) {
                        const data = senderUserDoc.data();
                        setSenderUserData({
                            name: data.name,
                            userId: user.uid,
                            profilePic: data.profilePic || 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg'
                        });

                        const receiverUserDoc = await getDoc(doc(db, 'users', receiverUID));
                        if (receiverUserDoc.exists()) {
                            const receiverData = receiverUserDoc.data();
                            setReceiverUserData({
                                name: receiverData.name,
                                userId: receiverUID,
                                profilePic: receiverData.profilePic || 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg'
                            });
                        }

                        // Fetch messages between sender and receiver
                        const chatDocRef = doc(db, 'directMessages', `${user.uid}_${receiverUID}`);
                        const unsubscribeMessages = onSnapshot(chatDocRef, (doc) => {
                            if (doc.exists()) {
                                const chatData = doc.data();
                                console.log("Chat data:", chatData);
                                setMessages(chatData.messages);
                            }
                        });

                        return () => unsubscribeMessages();
                    }
                } catch (error) {
                    console.error("Error getting user data:", error);
                }
            }
        });
        return () => unsubscribe();
    }, [receiverUID]);

    const handleSendMessage = async () => {
        if (newMessage.trim() === '' || !senderUserData || !receiverUserData) return;

        const newMessageData = {
            senderUID: senderUserData.userId,
            receiverUID: receiverUserData.userId,
            message: newMessage,
            timestamp: Timestamp.now() // Use Timestamp.now() instead of serverTimestamp()
        };

        try {
            const chatDocRef = doc(db, 'directMessages', `${senderUserData.userId}_${receiverUserData.userId}`);
            const chatDoc = await getDoc(chatDocRef);

            if (chatDoc.exists()) {
                // Update existing chat document
                await updateDoc(chatDocRef, {
                    messages: [...chatDoc.data().messages, newMessageData]
                });
            } else {
                // Create new chat document
                await setDoc(chatDocRef, {
                    senderUID: senderUserData.userId,
                    receiverUID: receiverUserData.userId,
                    messages: [newMessageData]
                });
            }

            setNewMessage('');
            setMessages([...chatDoc.data()?.messages, newMessageData])
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center p-4 border-b">
                {receiverUserData && (
                    <>
                        <Avatar src={receiverUserData.profilePic} alt={receiverUserData.name} />
                        <h2 className="ml-4 text-xl font-semibold">{receiverUserData.name}</h2>
                    </>
                )}
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.id === senderUserData?.userId ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-2 rounded-lg ${message.id === senderUserData?.userId ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                            {message.content}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message"
                    fullWidth
                />
                <Button onClick={handleSendMessage} variant="contained" color="primary" className="mt-2">
                    Send
                </Button>
            </div>
        </div>
    );
}