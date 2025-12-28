import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper to get user from localStorage synchronously
const getUserFromStorage = () => {
  try {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (token && savedUser) {
      return JSON.parse(savedUser);
    }
  } catch (error) {
    return null;
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage immediately (synchronous)
  // This is the ROOT CAUSE FIX: Initialize state from localStorage so user is available immediately
  const [user, setUser] = useState(() => getUserFromStorage());
  const [loading, setLoading] = useState(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only run once on mount - this is for checking existing sessions
    if (hasInitialized.current) return;
    
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      // User already loaded from initial state (useState initializer)
      // Just set loading to false immediately so UI can render
      setLoading(false);
      hasInitialized.current = true;
      
      // Verify token in background without blocking UI
      api.get('/auth/me', {
        params: { _t: Date.now() }, // Cache busting
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
        .then((res) => {
          // Only update if user data changed
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {
          // Token invalid, clear auth
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        });
    } else {
      // No saved session
      setLoading(false);
      hasInitialized.current = true;
    }
  }, []); // Empty dependency array - only run once on mount

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    // ROOT CAUSE FIX: Save to localStorage FIRST, then set state
    // This ensures localStorage is updated before any navigation happens
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Set state - this will trigger re-render
    setUser(user);
    setLoading(false);
    hasInitialized.current = true;
    
    return user;
  };

  const signup = async (name, email, password, role) => {
    const response = await api.post('/auth/signup', { name, email, password, role });
    const { token, user } = response.data;
    
    // ROOT CAUSE FIX: Save to localStorage FIRST, then set state
    // This ensures localStorage is updated before any navigation happens
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Set state - this will trigger re-render
    setUser(user);
    setLoading(false);
    hasInitialized.current = true;
    
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    hasInitialized.current = false; // Allow re-initialization on next mount
  };

  // ROOT CAUSE FIX: Return user directly from state
  // State is initialized from localStorage, so it's always in sync
  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

