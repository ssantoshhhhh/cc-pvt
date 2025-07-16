import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from '../axios';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch chats for the user
  useEffect(() => {
    let interval;
    const fetchChats = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await axios.get('/api/chats');
        setChats(response.data || []);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchChats();
      interval = setInterval(fetchChats, 5000); // Poll every 5s
    }
    return () => interval && clearInterval(interval);
  }, [user]);

  // Calculate total unread messages for the user
  const getTotalUnreadCount = () => {
    if (!user || !chats) return 0;
    let count = 0;
    chats.forEach(chat => {
      if (chat && Array.isArray(chat.messages)) {
        count += chat.messages.filter(
          msg => msg && !msg.isRead && msg.sender && msg.sender._id !== user.id
        ).length;
      }
    });
    return count;
  };

  return (
    <ChatContext.Provider value={{ chats, loading, error, totalUnread: getTotalUnreadCount() }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext); 