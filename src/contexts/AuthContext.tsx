import React, { createContext, useContext, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";
import { UserRole } from "@/types";

interface AppUser {
  uid: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole,ward?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);

  const login = async (
    email: string,
    password: string,
    role: "citizen" | "authority",
  ward?: string
  ) => {
    try {
      // Try login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const firebaseUser = userCredential.user;

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        role,
      });
    } catch (error: any) {
      // If user doesn't exist → sign up
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-credential"
      ) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const firebaseUser = userCredential.user;

        // Save role in Firestore
        await setDoc(doc(db, "users", firebaseUser.uid), {
          email: firebaseUser.email,
          role,
          ward: role === "authority" ? ward : null,
          createdAt: new Date(),
        });

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          role,
        });
      } else {
        throw error;
      }
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
