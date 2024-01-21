import React from "react";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import "react-native-url-polyfill/auto";
import { router } from "expo-router";

import { Session } from "../../shared/types";
import { AuthContext } from "../context/authContext";
import { getGoogleUrl } from "../../shared/util/getGoogleOauthUrl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clearPushToken } from "../api";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loadedFromStorage, setLoadedFromStorage] = React.useState(false);

  const signInWithGoogle = async () => {
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
      const user_id = params.get("user_id");
      if (token && email && user_id) {
        const s = {
          token,
          email,
          user_id: parseInt(user_id),
        };
        setSession(s);
        await SecureStore.setItemAsync("session", JSON.stringify(s));
      } else {
        router.replace("/");
      }
    }
  };

  const queryClient = useQueryClient();

  const clearPushTokenMutation = useMutation({
    mutationFn: async (sessionToken: string) => clearPushToken(sessionToken),
    onSuccess: () => {
      console.debug("successfully cleared push token");
    },
    onError: (error) => {
      console.error("error clearing push token", error);
    },
  });
  const signOut = async () => {
    queryClient.removeQueries();
    const token = session?.token;
    if (token) {
      clearPushTokenMutation.mutate(token);
    } else {
      console.error("no token to clear");
    }
    setSession(null);
    await SecureStore.deleteItemAsync("session");
    await SecureStore.deleteItemAsync("searchHistory");
    router.replace("/");
  };

  return (
    <AuthContext.Provider
      value={{
        signInWithGoogle,
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
