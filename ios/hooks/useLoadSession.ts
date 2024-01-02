import { useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { useSession } from "./useSession";
import { QueryClient, useQuery } from "@tanstack/react-query";
import {
  getChatGroupUnreadCount,
  getChatGroups,
  getItemsByCategory,
  getUserMeInfo,
  getUserMeItems,
} from "../api";
import { Session } from "../../shared/types";

const useRetrieveSession = (queryClient: QueryClient) => {
  const { setSession, setLoadedFromStorage, loadedFromStorage } = useSession();
  useEffect(() => {
    const getToken = async () => {
      const session = await SecureStore.getItemAsync("session");
      const sessionParsed = session ? (JSON.parse(session) as Session) : null;
      if (session) {
        setSession(sessionParsed);
      }
      setTimeout(() => {
        if (sessionParsed) {
          console.debug("PREFETCHING");
          queryClient.prefetchInfiniteQuery({
            queryFn: () => getItemsByCategory("all", 0),
            queryKey: ["item", "all"],
          });
          queryClient.prefetchQuery({
            queryKey: ["me"],
            queryFn: () => getUserMeInfo(sessionParsed.token),
          });
          queryClient.prefetchQuery({
            queryKey: ["unreadCount"],
            queryFn: () => getChatGroupUnreadCount(sessionParsed.token),
          });
          queryClient.prefetchQuery({
            queryFn: () => getChatGroups(sessionParsed.token, "buyer"),
            queryKey: ["chats", "Buy"],
          });
          queryClient.prefetchQuery({
            queryKey: ["list"],
            queryFn: () => getUserMeItems(sessionParsed.token),
          });
        }
        setLoadedFromStorage(true);
      }, 1000);
    };

    if (!loadedFromStorage) {
      getToken();
    }
  }, [loadedFromStorage, setSession, setLoadedFromStorage]);
};

export default useRetrieveSession;
