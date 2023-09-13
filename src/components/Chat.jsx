import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { auth } from '../firebase';

const Chat = ({ firestore, uid }) => {
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    loadChatMessages();
  }, []);

  async function loadChatMessages() {
    // Replace 'livestreams' with your Firestore collection name
    const chatCollectionRef = collection(firestore, 'livestreams', uid, 'chats');

    try {
      const querySnapshot = await getDocs(chatCollectionRef);
      const messages = querySnapshot.docs.map(doc => doc.data());
      setChatMessages(messages);
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  }

  async function sendChatMessage() {
    try {
      // Replace 'livestreams' with your Firestore collection name
      const chatCollectionRef = collection(firestore, 'livestreams', uid, 'chats');

      // Add a new chat message to Firestore
      await addDoc(chatCollectionRef, {
        text: chatMessage,
        timestamp: serverTimestamp(),
        sender: auth.currentUser.uid,
      });

      // Clear the chat input field after sending the message
      setChatMessage('');
    } catch (error) {
      console.error('Error sending chat message:', error);
    }
  }

  return (
    <div>
      {/* Chat input and messages */}
      <input
        type="text"
        placeholder="Type your message..."
        value={chatMessage}
        onChange={(e) => setChatMessage(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            sendChatMessage();
          }
        }}
      />
      <div>
        {chatMessages.map((message, index) => (
          <div key={index}>{message.text}</div>
        ))}
      </div>
    </div>
  );
};

export default Chat;
