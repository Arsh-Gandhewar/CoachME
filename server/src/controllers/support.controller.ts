import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import logger from '../utils/logger';

// Initialize the Gemini client
// Note: Requires GEMINI_API_KEY in .env
const ai = new GoogleGenAI({});

export const chatWithSupport = asyncHandler(async (req: Request, res: Response) => {
  const { message, history } = req.body;

  if (!message) {
    return ApiResponse.error(res, 400, 'Message is required');
  }

  try {
    const systemInstruction = `
      You are the "CoachME AI Support Assistant", a friendly, helpful, and concise customer support representative for the CoachME (also known as TrainersApp) platform. 
      CoachME is an app where users can find and book trainers for various sports, fitness, and activities (gym, yoga, swimming, martial arts, dance, cricket, football, tennis, basketball, running, cycling, golf, nutrition).

      You must answer user queries directly and politely. Do not hallucinate policies.
      
      If a user asks about FAQs, use the following strictly defined policies:
      - Cancellations: Bookings can be cancelled up to 24 hours before the scheduled session for a full refund.
      - Payments: Payments are processed securely via Razorpay. We support credit/debit cards, UPI, and net banking.
      - Refund Policy: Once approved, refunds are processed within 5-7 business days back to the original payment method.

      Keep your responses relatively brief, ideally 1-3 short paragraphs.
    `;

    // Map history to the format required by the SDK
    const formattedHistory = history ? history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    })) : [];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.3,
      }
    });

    const replyText = response.text || "I'm sorry, I couldn't process your request at this time.";

    return ApiResponse.success(res, { reply: replyText });
  } catch (error) {
    logger.error('Gemini API Error:', error);
    return ApiResponse.error(res, 500, 'Failed to process request with AI');
  }
});
