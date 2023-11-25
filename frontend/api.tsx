import { ChatGroup, Item, User } from "./types";

const API_URL = "https://api.gavinwang.dev";

export const REDIRECT_URL = "https://api.gavinwang.dev/auth/callback";

export const GOOGLE_OAUTH_CLIENT_ID =
  "479411838275-kpsk3vagvubv429vnhu85hsviahv8ed7.apps.googleusercontent.com";

async function parseOrThrowResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    try {
      const errMsg = await res.json();
      throw new Error(errMsg);
    } catch (e) {
      const errText = await res.text();
      throw new Error(errText);
    }
  }
  return res.json();
}

export async function getUserMeInfo(sessionToken: string): Promise<User> {
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
