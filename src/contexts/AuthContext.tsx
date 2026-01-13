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
  ward?: string;
}

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole, ward?: string) => Promise<void>;
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
    let firebaseUser;

    try {
      // 1. Try Login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      firebaseUser = userCredential.user;
    } catch (error: any) {
      // 2. If user is new, try Sign Up
      if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
        try {
          const signUpCredential = await createUserWithEmailAndPassword(auth, email, password);
          firebaseUser = signUpCredential.user;
        } catch (signUpError) {
          throw signUpError; // This would be things like "weak-password"
        }
      } else {
        throw error;
      }
    }

    // 3. Update Firestore (This is where "insufficient permissions" happens if rules aren't set)
    if (firebaseUser) {
      await setDoc(doc(db, "users", firebaseUser.uid), {
        email: firebaseUser.email,
        role: role,
        ward: ward || null,
        updatedAt: new Date()
      }, { merge: true });

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        role,
        ward: ward
      });
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth error");
  return context;
}