export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.199.211.209:5000/api';
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://10.199.211.209:5000';
export const APP_NAME = 'CoachME';
export const APP_VERSION = '1.0.0';

export const RAZORPAY_KEY = process.env.EXPO_PUBLIC_RAZORPAY_KEY || 'rzp_test_SsFnemBCyZjsKV';

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
};

export const SESSION_TYPES = ['Online', 'In-Person', 'Home Visit'] as const;
export const SORT_OPTIONS = [
  { label: 'Rating: High to Low', value: 'rating_desc' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Experience', value: 'experience_desc' },
  { label: 'Nearest', value: 'distance_asc' },
] as const;

export const PRICE_RANGES = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 - ₹1000', min: 500, max: 1000 },
  { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
  { label: '₹2000 - ₹5000', min: 2000, max: 5000 },
  { label: '₹5000+', min: 5000, max: 100000 },
] as const;
