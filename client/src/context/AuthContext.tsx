import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { loginUser, logoutUser } from '../api/serviceApi';

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Auth state/value တွေကို app တစ်လျှောက် share လုပ်ဖို့ context object
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  // context value ကို hook နဲ့ယူပြီး component တွေက auth state ကိုသုံးနိုင်အောင်ချိတ်
  const context = useContext(AuthContext);
  if (!context) {
    // provider မထည့်ထားတဲ့နေရာမှာ hook သုံးမိရင် error ပစ်
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // login ဝင်ထားတဲ့ user object ကို state နဲ့သိမ်း
  const [user, setUser] = useState<User | null>(null);
  // app စတင်ချိန် session restore လုပ်နေစဉ် loading state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // browser localStorage ထဲက token/user ကိုယူပြီး persisted login session နဲ့ချိတ်
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData)); // saved user JSON -> state
    }
    setIsLoading(false); // restore flow ပြီးသွားလို့ loading ပိတ်
  }, []);

  // Login page ကခေါ်တဲ့ auth login handler
  const login = async (username: string, password: string) => {
    try {
      const data = await loginUser(username, password); // serviceApi login endpoint
      const userData = { id: data.user.id, username: data.user.username, role: data.user.role };
      setUser(userData); // context user state update
      localStorage.setItem('accessToken', data.accessToken); // token persist
      localStorage.setItem('user', JSON.stringify(userData)); // user info persist
    } catch (error) {
      throw error; // error ကို caller (Login component) ဆီပြန်ပို့
    }
  };

  // logout action (menu/button) ကခေါ်မယ့် handler
  const logout = async () => {
    try {
      await logoutUser(); // backend logout endpoint
    } catch (error) {
      // network fail ဖြစ်လည်း local cleanup ဆက်လုပ်ဖို့ ignore
    } finally {
      setUser(null); // context user clear
      localStorage.removeItem('accessToken'); // token ဖျက်
      localStorage.removeItem('user'); // user data ဖျက်
      window.location.href = '/login'; // login page သို့ redirect
    }
  };

  // provider က children တွေဆီ ပေးမယ့် context value object
  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
