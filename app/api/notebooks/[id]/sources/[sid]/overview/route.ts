import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, MODELS } from "@/lib/anthropic";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function parseObj(text: string): any {
  const s = text.indexOf("{");
  const e = text.lastIndexOf("}");
  if (s === -1 || e === -1) return null;
  try {
    return JSON.parse(text.slice(s, e + 1));
  } catch {
    return null;
  }
}

// GET — an AI "Quellenübersicht" (German summary) + short category for a source.
export async function GET(
  _req: Request,
  { params }: { params: { id: string; sid: string } }
) {
  try {
    const supabase = getSupabase();
    const { data: src } = await supabase
      .from("sources")
      .select("*")
      .eq("id", params.sid)
      .eq("notebook_id", params.id)
      .single();
    if (!src) return NextResponse.json({ error: "not found" }, { status: 404 });

    const body = (src.content ?? src.snippet ?? "").slice(0, 6000);
    const anthropic = getAnthropic();
    const prompt = `Erstelle eine prägnante „Quellenübersicht" auf Deutsch (3–5 Sätze), die klar zusammenfasst, worum es in dieser Quelle geht und was sie aussagt. Gib außerdem eine kurze thematische Kategorie (2–3 Wörter).

Gib AUSSCHLIESSLICH gültiges JSON zurück (keine Erklärung, keine Code-Fences):
{"overview": string, "category": string}

Titel: ${src.title}
${src.url ? `URL: ${src.url}\n` : ""}Inhalt:
${body || "(kein weiterer Inhalt verfügbar)"}`;

    const resp = await anthropic.messages.create({
      model: MODELS.structured,
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });
    const text = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    const obj = parseObj(text);
    return NextResponse.json({
      overview: obj?.overview || body || "Für diese Quelle ist keine Übersicht verfügbar.",
      category: obj?.category || "",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
