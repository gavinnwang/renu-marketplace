import React from "react";
import { Session } from "../../shared/types";

type AuthContextType = {
  signIn: () => Promise<void>;
  signOut: () => void;
  session: Session | null;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  loadedFromStorage: boolean;
  setLoadedFromStorage: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);
