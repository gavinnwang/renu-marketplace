import React from "react";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import "react-native-url-polyfill/auto";
import { router } from "expo-router";

import { Session } from "../../shared/types";
import { AuthContext } from "../context/authContext";
import { getGoogleUrl } from "../../shared/util/getGoogleOauthUrl";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loadedFromStorage, setLoadedFromStorage] = React.useState(false);

  const signIn = async () => {
    const callbackUrl = Linking.createURL("App");
    const link = getGoogleUrl({
      device_type: "mobile",
      callback: callbackUrl,
    });

    const result: WebBrowser.WebBrowserAuthSessionResult =
      await WebBrowser.openAuthSessionAsync(link, callbackUrl);
    if (result.type === "success") {
      const params = new URL(result.url).searchParams;
      const token = params.get("token");
      const email = params.get("email");
      const name = params.get("name");
      const user_id = params.get("user_id");
      if (token && email && name && user_id) {
        const s = {
          token,
          email,
          name,
          user_id: parseInt(user_id),
        };
        setSession(s);
        await SecureStore.setItemAsync("session", JSON.stringify(s));
      } else {
        router.replace("/");
      }
    }
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync("session");
    await SecureStore.deleteItemAsync("searchHistory");
    setSession(null);
    router.replace("/");
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        session,
        setSession,
        loadedFromStorage,
        setLoadedFromStorage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
