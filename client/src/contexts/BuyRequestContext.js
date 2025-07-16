import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from '../axios';
import { useAuth } from './AuthContext';

const BuyRequestContext = createContext();

export const BuyRequestProvider = ({ children }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let interval;
    const fetchRequests = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await axios.get('/api/buy-requests');
        setRequests(response.data || []);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchRequests();
      interval = setInterval(fetchRequests, 10000); // Poll every 10s
    }
    return () => interval && clearInterval(interval);
  }, [user]);

  // Count of pending buy requests (for both buyer and seller roles)
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <BuyRequestContext.Provider value={{ requests, loading, error, pendingCount }}>
      {children}
    </BuyRequestContext.Provider>
  );
};

export const useBuyRequests = () => useContext(BuyRequestContext); 