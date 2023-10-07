import React from "react";
import * as WebBrowser from 'expo-web-browser';
import { getGoogleUrl } from "../utils/getGoogleOauthUrl";
import * as Linking from "expo-linking"
import 'react-native-url-polyfill/auto';


type AuthContextType = {
  signIn: (from: string) => Promise<void>;
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

  const signIn = async (from : string) => { 

    const link = getGoogleUrl(from);
    const callbackUrl = Linking.createURL("App");
    console.log("callbackUrl", callbackUrl);
    const result: WebBrowser.WebBrowserAuthSessionResult= await WebBrowser.openAuthSessionAsync(link,callbackUrl);
    console.log(result)
    if (result.type === "success") {
      const params = new URL(result.url).searchParams;
      const token = params.get("token");
      console.log("token", token)
      setSession(token);
    }    

  }

  const signOut = () => {

    
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
