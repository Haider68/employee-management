"use client";
import { AdminLogin, logOut, getMe } from "@/lib/api";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type UserRole = "admin" | "employe";

interface User {
  data: {
    _id?: string;
    userName?: string;
    email?: string;
    phone?: string;
  };
}

interface LoginFormData {
  email: string;
  password: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  authenticateUser: () => Promise<void>;
  loginUser: (formData: LoginFormData) => Promise<{ success: boolean; message: string }>;
  logoutUser: () => Promise<{ success: boolean; message: string }>;
  profileloader: boolean;
  loginLoading: boolean;
  logoutLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profileloader, setProfileLoader] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  
  useEffect(() => {
    authenticateUser();
  }, []);

  const authenticateUser = async () => {
    setProfileLoader(true);
    try {
      const userData = await getMe();
      if (userData) {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setProfileLoader(false);
    }
  };

  const loginUser = async (formData: LoginFormData): Promise<{ success: boolean; message: string }> => {
    setLoginLoading(true);
    try {
      const response = await AdminLogin(formData);
      if (response) {
        setUser(response);
        return {
          success: true,
          message: "Login successful!",
          data: response
        };
      }

      return {
        success: false,
        message: "Login failed. Please try again."
      };
    } catch (error: any) {
      return {
        success: false,
        message: error
      };
    } finally {
      setLoginLoading(false);
    }
  };

  const logoutUser = async (): Promise<{ success: boolean; message: string }> => {
    setLogoutLoading(true);
    try {
      const response = await logOut();
      console.log("response",response);
      if (response.success) {
        setUser(null);
        return {
          success: true,
          message: "Logged out successfully!"
        };
      }
      
      return {
        success: false,
        message: "Logout failed. Please try again."
      };
    } catch (error: any) {
      console.error("Logout error:", error);
      
      let errorMessage = "Logout failed. Please try again.";
      
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      
     
      setUser(null);
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      authenticateUser, 
      loginUser, 
      logoutUser,
      profileloader,
      loginLoading,
      logoutLoading
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useAuth = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useAuth must be used within a UserProvider");
  }
  return context;
};