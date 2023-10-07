import React from "react";
import * as WebBrowser from "expo-web-browser";
import { getGoogleUrl } from "../utils/getGoogleOauthUrl";
import * as Linking from "expo-linking";
import "react-native-url-polyfill/auto";
import * as SecureStore from "expo-secure-store";
import { Redirect, router } from "expo-router";

type Session = {
  token: string;
  email: string;
  name: string;
};

type AuthContextType = {
  signIn: (from: string) => Promise<void>;
  signOut: () => void;
  session: Session | null;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  loadedFromStorage: boolean;
  setLoadedFromStorage: React.Dispatch<React.SetStateAction<boolean>>;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

async function save(key: string, value: string) {
  await SecureStore.setItemAsync(key, value);
}

// async function getValueFor(key: string) {
//   let result = await SecureStore.getItemAsync(key);
//   if (result) {
//     alert("Here's your value \n" + result);
//   } else {
//     alert("No values stored under that key.");
//   }
// }

export function useSession() {
  const value = React.useContext(AuthContext);

  if (!value) {
    throw new Error("useSession must be wrapped in a <SessionProvider />");
  }

  return value;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadedFromStorage, setLoadedFromStorage] = React.useState(false);

  const signIn = async (from: string) => {
    const callbackUrl = Linking.createURL("App") + from;
    console.log("callbackUrl", callbackUrl);
    const link = getGoogleUrl(callbackUrl);

    const result: WebBrowser.WebBrowserAuthSessionResult =
      await WebBrowser.openAuthSessionAsync(link, callbackUrl);
    console.log(result);
    if (result.type === "success") {
      const params = new URL(result.url).searchParams;
      const token = params.get("token");
      const email = params.get("email");
      const name = params.get("name");
      if (token && email && name) {
        setSession({
          token: token,
          email: email,
          name: name,
        });
        await save("token", token);
        await save("email", email);
        await save("name", name);
      } else {
        router.replace("/failed-sign-in");
      }
    }
  };

  const signOut = () => {
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        session,
        isLoading,
        setIsLoading,
        setSession,
        loadedFromStorage,
        setLoadedFromStorage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
