import { ChatGroup, ChatMessage, Item, User } from "./types";

export const API_URL = "https://api.gavinwang.dev";

export const REDIRECT_URL = "https://api.gavinwang.dev/auth/callback";

export const GOOGLE_OAUTH_CLIENT_ID =
  "479411838275-kpsk3vagvubv429vnhu85hsviahv8ed7.apps.googleusercontent.com";

export async function parseOrThrowResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errMsg = await res.text();
    throw new Error(errMsg);
  }
  return res.json();
}

export async function getUserMeInfo(sessionToken: string): Promise<User> {
  console.debug("fetching me");
  const res = await fetch(`${API_URL}/users/me`, {
    headers: {
      authorization: `Bearer ${sessionToken}`,
    },
  });
  return parseOrThrowResponse<User>(res);
}

export async function getUserInfo(userId: number): Promise<User> {
  const res = await fetch(`${API_URL}/users/${userId}`);
  return parseOrThrowResponse<User>(res);
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

export async function mutateItemStatus(
  sessionToken: string,
  itemId: number,
  status: string
) {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_BACKEND_URL}/items/${itemId}`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );
  return parseOrThrowResponse(response);
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
