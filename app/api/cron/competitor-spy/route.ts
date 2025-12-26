import { NextResponse } from 'next/server';
import { smartModel } from '@/lib/ai';
import { generateText } from 'ai';
import { createClient } from '@/lib/db/server';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
    // This simulates a Cron Job or Edge Function
    // Usage: Call this endpoint to trigger scraping for all products with competitor_url
    try {
        const supabase = await createClient();

        // 1. Get products with competitor URLs
        const { data: products } = await supabase
            .from('products')
            .select('*')
            .not('competitor_url', 'is', null)
            .eq('auto_pricing_enabled', true);

        if (!products || products.length === 0) {
            return NextResponse.json({ message: "No products to spy on." });
        }

        const updates = [];

        // 2. Loop and Scrape (In real serverless, use message queue or split)
        for (const product of products) {
            try {
                // Fetch HTML
                const res = await fetch(product.competitor_url);
                const html = await res.text();
                const $ = cheerio.load(html);

                // Reduce HTML size for AI token limit (remove scripts, styles)
                $('script').remove();
                $('style').remove();
                const bodyText = $('body').text().substring(0, 10000); // Limit context

                // AI Extract
                const { text: aiJson } = await generateText({
                    model: smartModel,
                    system: "Extract product price from the raw HTML text. Output JSON: { \"price\": number }",
                    messages: [{ role: 'user', content: bodyText }]
                });

                const extracted = JSON.parse(aiJson.replace(/```json|```/g, '').trim());
                const competitorPrice = parseFloat(extracted.price);

                if (!isNaN(competitorPrice)) {
                    // Pricing Logic: Beat by 1 unit (dollar/baht)
                    if (competitorPrice < product.price) {
                        const newPrice = competitorPrice - 1;

                        // Check cost margin safety (optional but good practice)
                        if (!product.cost_price || newPrice > product.cost_price) {
                             await supabase.from('products').update({
                                 price: newPrice,
                                 competitor_price: competitorPrice,
                                 description: `${product.description || ''}\n\n🔥 Cheaper than Competitor!`
                             }).eq('id', product.id);

                             updates.push({ id: product.id, old: product.price, new: newPrice });
                        }
                    }
                }
            } catch (err) {
                console.error(`Failed to spy on product ${product.id}`, err);
            }
        }

        return NextResponse.json({ success: true, updates });

    } catch (error) {
        console.error("Spyglass Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
