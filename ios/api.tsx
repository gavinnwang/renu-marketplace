import Toast from "react-native-toast-message";
import {
  AICompleteResponse,
  AppleAuthResponse,
  ChatGroup,
  ChatMessage,
  Item,
  User,
} from "../shared/types";

// import Constants from "expo-constants";
// const config = Constants.expoConfig as any;
// export const API_URL = ("http://" +
//   config.hostUri.split(`:`).shift().concat(`:8080`)) as string;
// console.log("API_URL", API_URL);
// export const REDIRECT_URL = "http://localhost:8080/auth/google/callback";

export const API_URL = "https://api.gavinwang.dev";
export const REDIRECT_URL = "https://api.gavinwang.dev/auth/google/callback";

export const IMAGES_URL = "https://images.gavinwang.dev/";

export const GOOGLE_OAUTH_CLIENT_ID =
  "479411838275-kpsk3vagvubv429vnhu85hsviahv8ed7.apps.googleusercontent.com";

export async function parseOrThrowResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errMsg = await res.text();
    console.debug("error response", errMsg);
    Toast.show({
      type: "error",
      text1: `An error occured: ${errMsg}`,
    });
    throw new Error(errMsg);
  }
  return res.json();
}

export async function postAppleLogin(identityToken: string, username?: string) {
  const res = await fetch(`${API_URL}/auth/apple`, {
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      identity_token: identityToken,
      user_name: username,
      // dev: true,
    }),
  });
  return parseOrThrowResponse<AppleAuthResponse>(res);
}

export async function getUserMeInfo(sessionToken: string): Promise<User> {
  console.debug("getting user info", sessionToken);
  const res = await fetch(`${API_URL}/users/me`, {
    headers: {
      authorization: `Bearer ${sessionToken}`,
    },
  });
  return parseOrThrowResponse<User>(res);
}

export async function getUserInfo(userId: string): Promise<User> {
  const res = await fetch(`${API_URL}/users/${userId}`);
  return parseOrThrowResponse<User>(res);
}

export async function getUserActiveItems(userId: string): Promise<Item[]> {
  const res = await fetch(`${API_URL}/users/${userId}/items`);
  return parseOrThrowResponse<Item[]>(res);
}

export async function getSavedItems(sessionToken: string): Promise<Item[]> {
  const res = await fetch(`${API_URL}/saved/`, {
    headers: {
      authorization: `Bearer ${sessionToken}`,
    },
  });
  return parseOrThrowResponse<Item[]>(res);
}

export async function getUserMeItems(sessionToken: string): Promise<Item[]> {
  const res = await fetch(`${API_URL}/users/me/items`, {
    headers: {
      authorization: `Bearer ${sessionToken}`,
    },
  });
  return parseOrThrowResponse<Item[]>(res);
}

export async function postPushToken(sessionToken: string, pushToken: string) {
  console.debug("posting push token", sessionToken);
  const res = await fetch(`${API_URL}/users/me/push-token`, {
    headers: {
      authorization: `Bearer ${sessionToken}`,
      "content-type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      token: pushToken,
    }),
  });
  return parseOrThrowResponse(res);
}

export async function clearPushToken(sessionToken: string) {
  console.debug("clearing push token", sessionToken);
  const res = await fetch(`${API_URL}/users/me/push-token`, {
    headers: {
      authorization: `Bearer ${sessionToken}`,
      "content-type": "application/json",
    },
    method: "DELETE",
  });
  return parseOrThrowResponse(res);
}

export async function getChatGroups(
  sessionToken: string,
  buyerOrSeller: string
): Promise<ChatGroup[]> {
  const res = await fetch(`${API_URL}/chats/${buyerOrSeller}`, {
    headers: {
      authorization: `Bearer ${sessionToken}`,
    },
  });
  return parseOrThrowResponse<ChatGroup[]>(res);
}

export async function getAllChatGroups(sessionToken: string): Promise<{
  buyer_chat: ChatGroup[];
  seller_chat: ChatGroup[];
}> {
  const res = await fetch(`${API_URL}/chats/`, {
    headers: {
      authorization: `Bearer ${sessionToken}`,
    },
  });
  return parseOrThrowResponse<{
    buyer_chat: ChatGroup[];
    seller_chat: ChatGroup[];
  }>(res);
}

export async function getChatMessages(
  page: number,
  chatId: number,
  sessionToken: string
) {
  const res = await fetch(
    `${API_URL}/chats/messages/${chatId}?offset=${page}`,
    {
      headers: {
        authorization: `Bearer ${sessionToken}`,
      },
    }
  );
  return parseOrThrowResponse<ChatMessage[]>(res);
}

export async function getChatGroupUnreadCount(
  sessionToken: string
): Promise<number> {
  const res = await fetch(`${API_URL}/chats/unread-count`, {
    headers: {
      authorization: `Bearer ${sessionToken}`,
    },
  });
  return parseOrThrowResponse<number>(res);
}

export async function getChatIdFromItemId(
  sessionToken: string,
  itemId: string
): Promise<number> {
  const res = await fetch(`${API_URL}/chats/id/${itemId}`, {
    headers: {
      authorization: `Bearer ${sessionToken}`,
    },
  });
  return parseOrThrowResponse<number>(res);
}

export async function getItem(itemId: string): Promise<Item> {
  const res = await fetch(`${API_URL}/items/${itemId}`);
  return parseOrThrowResponse<Item>(res);
}

export async function getItemsByCategory(
  category: string,
  page: number,
  cache?: RequestCache
) {
  console.debug("fetching with pageParam and category", page, category);
  const res = await fetch(
    `${API_URL}/items/?category=${category}&page=${page}`,
    { cache: cache }
  );
  return parseOrThrowResponse<Item[]>(res);
}

export async function postItemStatus(
  sessionToken: string,
  itemId: number,
  status: string
) {
  const res = await fetch(`${API_URL}/items/${itemId}`, {
    headers: {
      authorization: `Bearer ${sessionToken}`,
      "content-type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ new_status: status }),
  });
  return parseOrThrowResponse<Item>(res);
}

export async function postChatRoomWithFirstMessage(
  sessionToken: string,
  message: string,
  itemId: string
): Promise<number> {
  const res = await fetch(`${API_URL}/chats/${itemId}`, {
    headers: {
      authorization: `Bearer ${sessionToken}`,
      "content-type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      first_message_content: message,
    }),
  });
  return parseOrThrowResponse<number>(res);
}

export async function postChangeSavedItemStatus(
  sessionToken: string,
  itemId: string,
  newStatus: boolean
): Promise<string> {
  const res = await fetch(`${API_URL}/saved/${itemId}`, {
    headers: {
      authorization: `Bearer ${sessionToken}`,
      "content-type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      new_status: newStatus,
    }),
  });
  return parseOrThrowResponse(res);
}

export async function getSavedItemStatus(
  sessionToken: string,
  itemId: string
): Promise<boolean> {
  const res = await fetch(`${API_URL}/saved/${itemId}`, {
    headers: {
      authorization: `Bearer ${sessionToken}`,
    },
  });
  return parseOrThrowResponse<boolean>(res);
}

export async function postAIComplete(
  sessionToken: string,
  imageUri: string
): Promise<AICompleteResponse> {
  const res = await fetch(`${API_URL}/openai/complete`, {
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${sessionToken}`,
    },
    method: "POST",
    body: JSON.stringify({
      image: imageUri,
    }),
  });
  return parseOrThrowResponse<AICompleteResponse>(res);
}

export async function getSearchItems(query: string): Promise<Item[]> {
  const res = await fetch(`${API_URL}/search/items?query=${query}`);
  return parseOrThrowResponse<Item[]>(res);
}

export async function postImages(
  images: string[],
  temp: Boolean
): Promise<string[]> {
  const formData = new FormData();
  for (let i = 0; i < images.length; i++) {
    const uri = images[i];
    const fileName = uri.split("/").pop();
    console.debug(fileName);
    const fileType = fileName?.split(".").pop() || "image/jpg";
    console.debug(fileType);
    formData.append("images", {
      uri: images[i],
      name: fileName,
      type: fileType,
    } as any);
    formData.append("temp", temp ? "true" : "false");
  }

  console.debug("form data: ", formData);
  const postImageResponse = await fetch(`${API_URL}/images/`, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    method: "POST",
    body: formData,
  });
  return parseOrThrowResponse<string[]>(postImageResponse);
}

export async function postNewItem(
  sessionToken: string,
  name: string,
  price: number,
  description: string,
  category: string,
  images: string[],
  location: string
): Promise<number> {
  const postItemResponse = await fetch(`${API_URL}/items/`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${sessionToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      price: Number(price),
      description,
      category,
      images,
      location,
    }),
  });
  return parseOrThrowResponse<number>(postItemResponse);
}

export async function getPopularSearchQueries(): Promise<string[]> {
  const res = await fetch(`${API_URL}/search/popular-queries`);
  return parseOrThrowResponse<string[]>(res);
}

export async function deleteItem(
  sessionToken: string,
  itemId: string
): Promise<string> {
  const res = await fetch(`${API_URL}/items/${itemId}`, {
    headers: {
      authorization: `Bearer ${sessionToken}`,
    },
    method: "DELETE",
  });
  return parseOrThrowResponse(res);
}

export async function deleteUser(sessionToken: string): Promise<string> {
  const res = await fetch(`${API_URL}/users/me`, {
    headers: {
      authorization: `Bearer ${sessionToken}`,
    },
    method: "DELETE",
  });
  return parseOrThrowResponse(res);
}

export async function blockUser(userId: string): Promise<string> {
  const res = await fetch(`${API_URL}/users/me/block/${userId}`, {
    method: "POST",
  });
  return parseOrThrowResponse(res);
}