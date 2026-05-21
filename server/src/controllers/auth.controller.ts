import { Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import Trainer from '../models/Trainer';
import { env } from '../config/env';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';
import { otpService } from '../services/otp.service';

const generateTokens = (id: string, role: string) => {
  const accessToken = jwt.sign({ id, role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRE as any });
  const refreshToken = jwt.sign({ id, role }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRE as any });
  return { accessToken, refreshToken };
};

const getCityCoordinates = async (city: string): Promise<[number, number]> => {
  if (!city) return [72.8777, 19.0760]; // Mumbai default
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`, {
      headers: { 'User-Agent': 'CoachME-App (contact@coachme.com)' }
    });
    const data = (await response.json()) as any[];
    if (data && data.length > 0) {
      return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
    }
  } catch (error) {
    console.log('Geocoding error:', error);
  }
  return [72.8777, 19.0760]; // Fallback to Mumbai
};

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password, role, name, fullName, mobile, category, experience, pricing, bio, city } = req.body;

  if (role === 'trainer') {
    const exists = await Trainer.findOne({ email });
    if (exists) throw ApiError.conflict('Email already registered');

    const parseList = (str?: string) => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];

    const trainer = await Trainer.create({
      fullName: fullName || name,
      email,
      password,
      mobile,
      category: category || '',
      categories: category ? [category] : [],
      experience: experience || 0,
      pricing: pricing || 0,
      bio: bio || '',
      city: city || '',
      resume: req.body.resume || '',
      specializations: parseList(req.body.specializations),
      certifications: parseList(req.body.certifications),
      sessionTypes: parseList(req.body.sessionTypes),
      languages: parseList(req.body.languages),
      exactLocation: { type: 'Point', coordinates: await getCityCoordinates(city || '') },
      isExactLocationShared: false,
      verificationStatus: 'verified', // Auto-verify so they appear in search immediately
    });

    const tokens = generateTokens(trainer._id.toString(), 'trainer');
    trainer.refreshToken = tokens.refreshToken;
    await trainer.save();

    const trainerObj = trainer.toObject();
    delete (trainerObj as any).password;
    delete (trainerObj as any).refreshToken;

    return ApiResponse.created(res, { user: trainerObj, ...tokens }, 'Trainer registered successfully');
  } else {
    const exists = await User.findOne({ email });
    if (exists) throw ApiError.conflict('Email already registered');

    const user = await User.create({ name: name || 'User', email, password, mobile, city });
    const tokens = generateTokens(user._id.toString(), 'user');
    user.refreshToken = tokens.refreshToken;
    await user.save();

    const userObj = user.toObject();
    delete (userObj as any).password;
    delete (userObj as any).refreshToken;

    return ApiResponse.created(res, { user: userObj, ...tokens }, 'User registered successfully');
  }
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  // Try user first
  let user = await User.findOne({ email }).select('+password');
  if (user) {
    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw ApiError.unauthorized('Invalid credentials');
    const tokens = generateTokens(user._id.toString(), user.role);
    user.refreshToken = tokens.refreshToken;
    await user.save();
    const userObj = user.toObject();
    delete (userObj as any).password;
    delete (userObj as any).refreshToken;
    return ApiResponse.success(res, { user: userObj, ...tokens }, 'Login successful');
  }

  // Try trainer
  const trainer = await Trainer.findOne({ email }).select('+password');
  if (trainer) {
    const isMatch = await trainer.comparePassword(password);
    if (!isMatch) throw ApiError.unauthorized('Invalid credentials');
    const tokens = generateTokens(trainer._id.toString(), 'trainer');
    trainer.refreshToken = tokens.refreshToken;
    await trainer.save();
    const trainerObj = trainer.toObject();
    delete (trainerObj as any).password;
    delete (trainerObj as any).refreshToken;
    return ApiResponse.success(res, { user: trainerObj, role: 'trainer', ...tokens }, 'Login successful');
  }

  throw ApiError.unauthorized('Invalid credentials');
});

export const sendOtp = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email } = req.body;
  otpService.generate(email);
  return ApiResponse.success(res, null, 'OTP sent successfully (check server console in dev mode)');
});

export const verifyOtp = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, otp } = req.body;
  const isValid = otpService.verify(email, otp);
  if (!isValid) throw ApiError.badRequest('Invalid or expired OTP');

  // Mark user/trainer as verified
  await User.findOneAndUpdate({ email }, { isVerified: true });
  await Trainer.findOneAndUpdate({ email }, { isVerified: true });

  return ApiResponse.success(res, null, 'OTP verified successfully');
});

export const forgotPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email } = req.body;
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 min

  const user = await User.findOne({ email });
  if (user) {
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = expiry;
    await user.save();
  } else {
    const trainer = await Trainer.findOne({ email });
    if (trainer) {
      trainer.resetPasswordToken = hashedToken;
      trainer.resetPasswordExpire = expiry;
      await trainer.save();
    }
  }

  console.log(`🔑 [MOCK EMAIL] Reset token for ${email}: ${resetToken}`);
  return ApiResponse.success(res, null, 'Password reset link sent (check server console in dev mode)');
});

export const resetPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  let user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } }).select('+resetPasswordToken +resetPasswordExpire');
  if (user) {
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return ApiResponse.success(res, null, 'Password reset successful');
  }

  const trainer = await Trainer.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } }).select('+resetPasswordToken +resetPasswordExpire');
  if (trainer) {
    trainer.password = password;
    trainer.resetPasswordToken = undefined;
    trainer.resetPasswordExpire = undefined;
    await trainer.save();
    return ApiResponse.success(res, null, 'Password reset successful');
  }

  throw ApiError.badRequest('Invalid or expired reset token');
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const { id: userId, role } = req.user as any; // protect middleware should attach user/role

  let userOrTrainer: any;
  if (role === 'trainer') {
    userOrTrainer = await Trainer.findById(userId).select('+password');
  } else {
    userOrTrainer = await User.findById(userId).select('+password');
  }

  if (!userOrTrainer) {
    throw ApiError.unauthorized('User not found');
  }

  const isMatch = await userOrTrainer.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.badRequest('Incorrect current password');
  }

  userOrTrainer.password = newPassword;
  await userOrTrainer.save();

  return ApiResponse.success(res, null, 'Password changed successfully');
});

export const refreshToken = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { refreshToken: token } = req.body;
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string; role: string };

  let entity: any;
  if (decoded.role === 'trainer') {
    entity = await Trainer.findById(decoded.id).select('+refreshToken');
  } else {
    entity = await User.findById(decoded.id).select('+refreshToken');
  }

  if (!entity || entity.refreshToken !== token) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const tokens = generateTokens(decoded.id, decoded.role);
  entity.refreshToken = tokens.refreshToken;
  await entity.save();

  return ApiResponse.success(res, tokens, 'Token refreshed');
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  return ApiResponse.success(res, { user: req.user, role: req.userRole }, 'Profile fetched');
});
