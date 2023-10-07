import React from "react";

type AuthContextType = {
  signIn: () => void;
  signOut: () => void;
  session: string | null;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
} 

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function useSession() {
  const value = React.useContext(AuthContext);

  if (!value) {
    throw new Error("useSession must be wrapped in a <SessionProvider />");
  }

  return value;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const signIn = () => { 
    console.log("sign in");
    setSession("xxx");
  }

  const signOut = () => {
    console.log("sign out");
    setSession(null);
  }

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        session,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
