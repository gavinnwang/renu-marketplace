import { useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { useSession } from "./useSession";
import { QueryClient } from "@tanstack/react-query";
import {
  getAllChatGroups,
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
        if (sessionParsed && !sessionParsed.is_guest) {
          console.debug("prefetching");
          queryClient.prefetchInfiniteQuery({
            queryFn: () => getItemsByCategory("all", 0),
            queryKey: ["item", "all"],
          });
          queryClient.prefetchQuery({
            queryKey: ["me"],
            queryFn: () => getUserMeInfo(sessionParsed.token),
          });
          queryClient.prefetchQuery({
            queryFn: () => getAllChatGroups(sessionParsed.token),
            queryKey: ["chats"],
          });
          queryClient.prefetchQuery({
            queryKey: ["list"],
            queryFn: () => getUserMeItems(sessionParsed.token),
          });
        }
        setLoadedFromStorage(true);
      }, 750);
    };

    if (!loadedFromStorage) {
      getToken();
    }
  }, [loadedFromStorage, setSession, setLoadedFromStorage]);
};

export default useRetrieveSession;
