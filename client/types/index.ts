export interface User {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  profileImage?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  city?: string;
  role: 'user';
  favorites: string[];
  isVerified: boolean;
  createdAt: string;
}

export interface Trainer {
  _id: string;
  fullName: string;
  email: string;
  mobile?: string;
  profilePhoto?: string;
  portfolioImages?: string[];
  bio: string;
  experience: number;
  certifications: string[];
  achievements: string[];
  pricing: number;
  priceUnit: string;
  categories: string[];
  category: string;
  languages: string[];
  city: string;
  specializations: string[];
  distance?: number;
  availability: Record<string, string[]>;
  sessionTypes: string[];
  rating: number;
  totalReviews: number;
  reviewCount: number;
  portfolioImages: string[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
  isPremium: boolean;
  premium: boolean;
  verified: boolean;
  walletBalance: number;
  reviews: Review[];
  gallery: string[];
  createdAt: string;
}

export interface Booking {
  _id: string;
  userId: string | User;
  trainerId: string | Trainer;
  bookingDate: string;
  timeSlot: string;
  sessionType: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  bookingStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  meetingLink?: string;
  notes?: string;
  price: number;
  createdAt: string;
}

export interface Review {
  _id: string;
  userId: string | User;
  trainerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  gradient: string;
  isActive: boolean;
}

export interface ChatMessage {
  _id?: string;
  senderId: string;
  text: string;
  timestamp: string;
  seen: boolean;
}

export interface Chat {
  _id: string;
  participants: string[];
  messages: ChatMessage[];
  lastMessage?: { text: string; timestamp: string; senderId: string };
  otherParticipant?: User | Trainer;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'booking' | 'chat' | 'payment' | 'system';
  readStatus: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name?: string;
  fullName?: string;
  email: string;
  password: string;
  mobile?: string;
  role: 'user' | 'trainer';
  category?: string;
  experience?: number;
  pricing?: number;
  bio?: string;
  city?: string;
}

export interface OtpVerifyPayload {
  email: string;
  otp: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SlotInfo {
  time: string;
  available: boolean;
}
