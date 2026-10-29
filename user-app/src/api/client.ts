import { create, isAxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export const TOKEN_KEY = "event_planner_user_token";
export const ACCOUNT_KEY = "event_planner_user_account";

let currentToken: string | null = null;
export function setAccessToken(token: string | null) {
  currentToken = token;
}

export const api = create({ timeout: 15000 });
api.interceptors.request.use(async (config) => {
  const configuredURL =
    (Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_API_URL_ANDROID
      : process.env.EXPO_PUBLIC_API_URL_IOS) ||
    process.env.EXPO_PUBLIC_API_URL;
  const baseURL = configuredURL?.trim().replace(/\/$/, "");
  if (!baseURL)
    throw new Error(
      "Set the API URL in user-app/.env, then reload the app.",
    );
  config.baseURL = baseURL;
  const token = currentToken ?? (await AsyncStorage.getItem(TOKEN_KEY));
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function apiError(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response)
      return "Could not reach the API. Check your network and API URL.";
    const message = error.response.data?.message;
    return typeof message === "string"
      ? message
      : "The request could not be completed.";
  }
  return error instanceof Error ? error.message : "Something went wrong.";
}
