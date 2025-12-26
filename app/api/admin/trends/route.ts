import { NextResponse } from 'next/server';
import { smartModel } from '@/lib/ai';
import { generateText } from 'ai';
import { createClient } from '@/lib/db/server';

export async function GET(req: Request) {
    try {
        const supabase = await createClient();

        // 1. Fetch Zero-Result Logs
        const { data: logs } = await supabase
            .from('search_logs')
            .select('query')
            .eq('results_count', 0)
            .limit(100); // Analyze last 100 failed searches

        if (!logs || logs.length === 0) {
            return NextResponse.json({ message: "No search gaps found." });
        }

        const queries = logs.map(l => l.query);

        // 2. Gemini Cluster Analysis
        const { text: aiAnalysis } = await generateText({
            model: smartModel,
            system: `You are a Trend Analyst. Analyze these failed search queries and cluster them into top 3 missing product opportunities.
            Input: List of strings.
            Output JSON:
            [
                { "opportunity": "iPhone 16 Cases", "count": 15, "recommendation": "High demand, verify suppliers." },
                ...
            ]`,
            messages: [{ role: 'user', content: JSON.stringify(queries) }]
        });

        // Parse
        const cleanJson = aiAnalysis.replace(/```json|```/g, '').trim();
        const opportunities = JSON.parse(cleanJson);

        return NextResponse.json({ opportunities });

    } catch (error) {
        return NextResponse.json({ error: "Trend Analysis Failed" }, { status: 500 });
    }
}
