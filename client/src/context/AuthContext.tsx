import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { auth, loginWithGoogle, loginWithEmailPassword, registerWithEmailPassword, logoutUser } from "../lib/firebase";
import { apiRequest } from "@/lib/queryClient";

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  loginWithGoogle: async () => {},
  loginWithEmail: async () => {},
  registerWithEmail: async () => {},
  logout: async () => {},
  getToken: async () => null,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getToken = async () => {
    if (!user) return null;
    try {
      return await user.getIdToken(true); // Force refresh the token
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  // Create or update user in the backend after Firebase authentication
  const syncUserWithBackend = async (user: FirebaseUser) => {
    try {
      const idToken = await user.getIdToken(true);
      await apiRequest("POST", "/api/users/sync", {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      }, idToken);
    } catch (error) {
      console.error("Error syncing user with backend:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        await syncUserWithBackend(firebaseUser);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLoginWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      await loginWithGoogle();
    } catch (error) {
      setError("Failed to sign in with Google");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await loginWithEmailPassword(email, password);
    } catch (error) {
      setError("Failed to sign in with email/password");
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await registerWithEmailPassword(email, password);
    } catch (error) {
      setError("Failed to register");
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      setError(null);
      await logoutUser();
    } catch (error) {
      setError("Failed to log out");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    loginWithGoogle: handleLoginWithGoogle,
    loginWithEmail: handleLoginWithEmail,
    registerWithEmail: handleRegisterWithEmail,
    logout: handleLogout,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
