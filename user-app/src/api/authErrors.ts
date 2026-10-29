import { isAxiosError } from "axios";

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function authError(error: unknown, action: "login" | "register"): string {
  if (isAxiosError(error)) {
    if (!error.response) return "We couldn't connect. Check your internet connection and try again.";
    const { status, data } = error.response;
    const message = typeof data?.message === "string" ? data.message : "";
    if (status === 401) return "Incorrect email or password. Please try again.";
    if (status === 409 || /email already registered/i.test(message))
      return "This email is already registered. Log in instead.";
    if (status === 429) return "Too many attempts. Please wait a moment and try again.";
    if (status >= 500) return "Something went wrong on our side. Please try again shortly.";
    if (/email:|invalid email/i.test(message)) return "Enter a valid email address.";
    if (/password:/i.test(message)) return "Password must be at least 8 characters.";
    if (/name:/i.test(message)) return "Enter your full name.";
    if (/phone:/i.test(message)) return "Enter a valid phone number.";
    if (status === 400) return "Please check your details and try again.";
  }
  return action === "login"
    ? "We couldn't log you in. Please try again."
    : "We couldn't create your account. Please try again.";
}
