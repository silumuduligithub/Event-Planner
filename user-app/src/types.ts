export type Service = {
  _id: string; name: string; pricingType: 'fixed' | 'per_plate' | 'per_hour' | 'per_day' | 'per_event';
  price: number; description?: string; isOptional: boolean;
  occasionKeys?: string[];
};
export type Artist = {
  _id: string; name: string; roleOrSkill?: string; pricePerPerformance: number;
  photo?: string; sampleAudioVideoUrl?: string; bio?: string; isAvailable: boolean;
};
export type Vendor = {
  _id: string; businessName: string; ownerName: string; phone?: string; vendorType: string; description?: string;
  address: { city: string; state?: string }; portfolioImages: string[]; videoLinks: string[];
  startingPrice: number; services: Service[]; artistsOrCelebrities: Artist[];
  rating: number; reviewCount: number; isVerified: boolean;
  supportedOccasionKeys?: string[]; acceptsCustomOccasions?: boolean;
};
export type User = { _id: string; name: string; email: string; city?: string; phone?: string; avatar?: string };
export type ChecklistItem = { _id: string; title: string; completed: boolean; dueDate?: string };
export type Event = {
  _id: string; title: string; eventType: string; occasionKey?: string; eventDate: string;
  location: { city: string; venueName?: string }; totalBudget: number;
  estimatedGuests: number; status: string; checklist: ChecklistItem[];
};
export type EstimateInput = {
  vendorId: string; bookingType: 'full_event_package' | 'single_service' | 'orchestra_celebrity';
  occasion?: string;
  selectedServices: { serviceId: string; quantity: number; requirements?: ServiceRequirements }[];
  selectedCelebrities: { artistId: string; requirements?: ServiceRequirements }[];
};
export type RequirementKey = 'menu' | 'meal' | 'requests' | 'theme' | 'area' | 'setup' | 'start' | 'coverage' | 'format' | 'look' | 'layout';
export type ServiceRequirements = Partial<Record<RequirementKey, string>>;
export type Estimate = {
  occasion?: string;
  selectedServices: { serviceId: string; name: string; pricingType: string; unitPrice: number; quantity: number; totalPrice: number; requirements?: ServiceRequirements }[];
  selectedCelebrities: { artistId: string; name: string; roleOrSkill?: string; price: number; requirements?: ServiceRequirements }[];
  subtotal: number; discount: number; taxAmount: number; totalAmount: number;
  advanceAmount: number; pendingAmount: number; taxRate: number; advanceRate: number;
  quoteFingerprint: string;
};
export type Booking = Estimate & {
  _id: string; bookingType: EstimateInput['bookingType']; vendorId: Vendor | string;
  eventId?: string; eventDate: string; eventLocation: { city: string; address?: string }; status: string; createdAt: string;
  userNotes?: string;
};
export type Review = { _id: string; userId: Pick<User, '_id' | 'name' | 'avatar'>; vendorId: string; bookingId: string; rating: number; comment?: string; createdAt: string };
export type ApiResponse<T> = { success: boolean; message: string; data: T };
