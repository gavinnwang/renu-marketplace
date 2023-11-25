import { Item } from "./types/types";

const API_URL = "https://api.gavinwang.dev";

export const REDIRECT_URL = "https://api.gavinwang.dev/auth/callback";

export const GOOGLE_OAUTH_CLIENT_ID =
  "479411838275-kpsk3vagvubv429vnhu85hsviahv8ed7.apps.googleusercontent.com";

async function parseOrThrowResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(await res.json());
  }
  return res.json();
}

