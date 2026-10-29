import { api } from "./client";
import type {
  ApiResponse,
  Booking,
  Estimate,
  EstimateInput,
  Event,
  User,
  Vendor,
  Review,
} from "../types";

export const authApi = {
  forgotPassword: (email: string) => api.post<ApiResponse<null>>('/api/auth/user/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post<ApiResponse<null>>('/api/auth/user/reset-password', { token, password }),
  google: (identityToken: string) => api.post<ApiResponse<{ account: User; token: string }>>('/api/auth/user/google', { identityToken }),
  apple: (identityToken: string, nonce: string, name?: string) => api.post<ApiResponse<{ account: User; token: string }>>('/api/auth/user/apple', { identityToken, nonce, name }),
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ account: User; token: string }>>(
      "/api/auth/user/login",
      { email, password },
    ),
  register: (input: {
    name: string;
    email: string;
    password: string;
    city?: string;
    phone?: string;
  }) =>
    api.post<ApiResponse<{ account: User; token: string }>>(
      "/api/auth/user/register",
      input,
    ),
};
export const vendorApi = {
  list: (params: {
    search?: string;
    city?: string;
    category?: string;
    occasion?: string;
    page?: number;
    minPrice?: number;
    maxPrice?: number;
  }) =>
    api.get<
      ApiResponse<{
        vendors: Vendor[];
        total: number;
        page: number;
        limit: number;
        matchedOccasion: string | null;
      }>
    >("/api/vendors", { params }),
  detail: (id: string, occasion?: string) => api.get<ApiResponse<Vendor>>(`/api/vendors/${id}`, { params: occasion ? { occasion } : undefined }),
  reviews: (id: string) => api.get<ApiResponse<{ reviews: Review[]; total: number }>>(`/api/vendors/${id}/reviews`),
  addReview: (id: string, input: { bookingId: string; rating: number; comment?: string }) => api.post<ApiResponse<Review>>(`/api/vendors/${id}/reviews`, input),
};
export const bookingApi = {
  estimate: (input: EstimateInput, signal?: AbortSignal) =>
    api.post<ApiResponse<Estimate>>("/api/bookings/calculate-estimate", input, {
      signal,
    }),
  create: (
    input: EstimateInput & {
      eventDate: string;
      eventLocation: { city: string; address?: string };
      eventId?: string;
      userNotes?: string;
      requestKey?: string;
      expectedQuoteFingerprint?: string;
    },
  ) => api.post<ApiResponse<Booking>>("/api/bookings", input),
  list: () => api.get<ApiResponse<Booking[]>>("/api/bookings/user"),
  detail: (id: string) => api.get<ApiResponse<Booking>>(`/api/bookings/user/${id}`),
  cancel: (id: string) => api.patch<ApiResponse<Booking>>(`/api/bookings/user/${id}/cancel`),
};
export const eventApi = {
  list: () => api.get<ApiResponse<Event[]>>("/api/events"),
  detail: (id: string) => api.get<ApiResponse<Event>>(`/api/events/${id}`),
  create: (input: {
    title: string;
    eventType: string;
    eventDate: string;
    location: { city: string };
    totalBudget: number;
    estimatedGuests: number;
  }) => api.post<ApiResponse<Event>>("/api/events", input),
  update: (id: string, input: Partial<Pick<Event, 'title' | 'eventType' | 'eventDate' | 'estimatedGuests' | 'totalBudget' | 'status'>>) => api.put<ApiResponse<Event>>(`/api/events/${id}`, input),
  addChecklistItem: (id: string, title: string) => api.post<ApiResponse<Event>>(`/api/events/${id}/checklist`, { title }),
  updateChecklistItem: (id: string, itemId: string, input: { title?: string; completed?: boolean }) => api.patch<ApiResponse<Event>>(`/api/events/${id}/checklist/${itemId}`, input),
  removeChecklistItem: (id: string, itemId: string) => api.delete<ApiResponse<Event>>(`/api/events/${id}/checklist/${itemId}`),
};
export const userApi = {
  me: () => api.get<ApiResponse<User>>('/api/users/me'),
  update: (input: { name?: string; city?: string; phone?: string }) => api.patch<ApiResponse<User>>('/api/users/me', input),
  saved: () => api.get<ApiResponse<Vendor[]>>('/api/users/me/saved-vendors'),
  save: (id: string) => api.put<ApiResponse<Vendor[]>>(`/api/users/me/saved-vendors/${id}`),
  unsave: (id: string) => api.delete<ApiResponse<Vendor[]>>(`/api/users/me/saved-vendors/${id}`),
};
