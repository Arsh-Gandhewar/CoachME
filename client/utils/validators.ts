export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain an uppercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain a number' };
  }
  return { valid: true, message: '' };
};

export const validateMobile = (mobile: string): boolean => {
  const regex = /^[6-9]\d{9}$/;
  return regex.test(mobile);
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

export const validateOtp = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

export const validatePrice = (price: number): boolean => {
  return price > 0 && price <= 100000;
};

export const validateExperience = (exp: number): boolean => {
  return exp >= 0 && exp <= 50;
};
