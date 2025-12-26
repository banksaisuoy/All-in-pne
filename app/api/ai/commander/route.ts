import { NextResponse } from 'next/server';
import { fastModel } from '@/lib/ai';
import { generateText } from 'ai';
import { createClient } from '@/lib/db/server';

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
        return NextResponse.json({ error: "No transcript provided" }, { status: 400 });
    }

    // 1. Interpret Voice Command with Gemini
    const { text: aiResponse } = await generateText({
      model: fastModel,
      system: `You are an AI Database Admin. Convert natural language commands into a strictly formatted JSON object for database execution.

      Output Format:
      {
          "action": "UPDATE",
          "table": "products", // or "coupons", "orders"
          "filter": "SQL_WHERE_CLAUSE", // e.g. "color = 'red'" or "stock < 5" or "1=1" for all
          "update_field": "COLUMN_NAME",
          "update_value": "VALUE_EXPRESSION", // e.g. "price * 0.9" (for math) or "'Active'" (for string)
          "response_speech": "Natural language confirmation"
      }

      Example: "Give a 10% discount on all red shoes"
      Result: { "action": "UPDATE", "table": "products", "filter": "title ILIKE '%red%' AND title ILIKE '%shoes%'", "update_field": "price", "update_value": "price * 0.9", "response_speech": "Applying 10% discount to all red shoes." }

      Only output JSON.`,
      messages: [
        { role: 'user', content: transcript }
      ]
    });

    // Clean markdown code blocks if present
    const cleanJson = aiResponse.replace(/```json|```/g, '').trim();
    let command;
    try {
        command = JSON.parse(cleanJson);
    } catch (e) {
        console.error("Failed to parse Gemini JSON", cleanJson);
        return NextResponse.json({ error: "AI produced invalid JSON" }, { status: 500 });
    }

    // 2. Execute via Supabase RPC
    // Security Note: RPC `execute_ai_update` should be restricted to Admins via RLS/Policies in real prod.
    const supabase = await createClient();

    if (command.action === 'UPDATE') {
        const { error } = await supabase.rpc('execute_ai_update', {
            table_name: command.table,
            update_field: command.update_field,
            update_value_expression: command.update_value,
            filter_condition: command.filter
        });

        if (error) {
            console.error("RPC Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }

    return NextResponse.json({
        speech: command.response_speech,
        debug: command
    });

  } catch (error) {
    console.error("Voice Commander Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
