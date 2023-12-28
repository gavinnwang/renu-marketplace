import { useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { useSession } from "./useSession";

const useRetrieveSession = () => {
  const { setSession, setLoadedFromStorage, loadedFromStorage } = useSession();
  useEffect(() => {
    const getToken = async () => {
      const session = await SecureStore.getItemAsync("session");
      if (session) {
        setSession(JSON.parse(session));
      }
      setTimeout(() => {
        console.log("loaded from storage to true");
        setLoadedFromStorage(true);
      }, 750);
    };

    if (!loadedFromStorage) {
      getToken();
    }
  }, [loadedFromStorage, setSession, setLoadedFromStorage]);
};

export default useRetrieveSession;
