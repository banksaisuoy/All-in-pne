'use server';

import { generateObject } from 'ai';
import { aiModel } from '@/lib/ai/config';
import { z } from 'zod';
import { addMockOrder } from '@/lib/db/mock';

const slipVerificationSchema = z.object({
  isValid: z.boolean().describe("True if the slip appears to be a valid payment receipt"),
  detectedAmount: z.number().describe("The amount detected on the slip"),
  date: z.string().describe("The date detected on the slip in YYYY-MM-DD format"),
  reasoning: z.string().describe("Reasoning for the validation decision"),
});

export async function verifySlip(imageBase64: string, expectedAmount: number) {
  try {
    const { object } = await generateObject({
      model: aiModel,
      schema: slipVerificationSchema,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this payment slip. Determine if it is a valid receipt, extract the amount and date. Compare the detected amount with the expected amount of ${expectedAmount}. If they match closely and the slip looks legitimate, set isValid to true.`
            },
            { type: 'image', image: imageBase64 },
          ],
        },
      ],
    });

    // Add extra validation logic if needed
    const amountMatches = Math.abs(object.detectedAmount - expectedAmount) < 0.05;

    return {
      success: true,
      data: {
        ...object,
        amountMatches,
        finalDecision: object.isValid && amountMatches
      }
    };
  } catch (error) {
    console.error('Slip Verification Error:', error);
    return { success: false, error: 'Failed to verify slip. Please ensure the image is clear.' };
  }
}

export async function createOrder(totalAmount: number) {
  // In a real app, this would save the cart items to the database
  // For the mock, we just generate an order ID and save to mock DB
  const newOrder = {
    id: `ORD-${Math.floor(Math.random() * 10000)}`,
    totalAmount,
    status: 'paid',
    createdAt: new Date().toISOString(),
  };

  addMockOrder(newOrder);

  return { success: true, orderId: newOrder.id };
}
