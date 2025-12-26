import { NextResponse } from 'next/server';
import { fastModel } from '@/lib/ai';
import { generateText } from 'ai';
import { createClient } from '@/lib/db/server';

export async function POST(req: Request) {
  try {
    const { message, productId, currentPrice } = await req.json();
    const supabase = await createClient();

    // 1. Get Product Data (Cost Price)
    const { data: product } = await supabase
        .from('products')
        .select('cost_price, title')
        .eq('id', productId)
        .single();

    if (!product || !product.cost_price) {
        // Fallback if no cost price set
        return NextResponse.json({
            reply: "I can't offer a lower price right now, but this is the best quality in the market!"
        });
    }

    // 2. AI Reasoner
    const minAcceptablePrice = product.cost_price * 1.15;

    // Ask AI to analyze intent and extract offer
    const { text: aiAnalysis } = await generateText({
        model: fastModel,
        system: `You are a negotiation bot. Analyze the user's message.
        Current Price: ${currentPrice}
        Minimum Price: ${minAcceptablePrice}

        If user asks for discount:
        - Extract their offer.
        - If offer >= Minimum Price: JSON output { "decision": "ACCEPT", "offer": number }
        - If offer < Minimum Price: JSON output { "decision": "REJECT", "counter_offer": number (slightly above min) }
        - If no specific number: JSON output { "decision": "CHAT", "reply": "string" }

        Only output JSON.`,
        messages: [{ role: 'user', content: message }]
    });

    const cleanJson = aiAnalysis.replace(/```json|```/g, '').trim();
    let analysis;
    try {
        analysis = JSON.parse(cleanJson);
    } catch {
        // Fallback
        return NextResponse.json({ reply: "Could you repeat your offer?" });
    }

    // 3. Action
    if (analysis.decision === 'ACCEPT') {
        // Create One-Time Coupon
        const couponCode = `DEAL-${Math.random().toString(36).substring(7).toUpperCase()}`;
        const discountAmount = currentPrice - analysis.offer;

        await supabase.from('coupons').insert({
            code: couponCode,
            discount_amount: discountAmount,
            is_ai_generated: true,
            is_hidden: true
        });

        return NextResponse.json({
            reply: `Deal! I've generated a special code for you: ${couponCode}. Enter this at checkout to get it for $${analysis.offer}!`
        });
    }
    else if (analysis.decision === 'REJECT') {
        return NextResponse.json({
            reply: `I can't do $${analysis.offer}, that's below cost! But I can meet you at $${analysis.counter_offer}. This is a steal!`
        });
    }

    return NextResponse.json({ reply: analysis.reply || "I'm listening." });

  } catch (error) {
    console.error("Negotiator Error:", error);
    return NextResponse.json({ error: "AI Busy" }, { status: 500 });
  }
}
