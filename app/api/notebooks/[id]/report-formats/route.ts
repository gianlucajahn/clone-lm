import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, MODELS } from "@/lib/anthropic";
import { getSupabase } from "@/lib/supabase";
import type { Source } from "@/lib/notebooks";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const FALLBACK = [
  { title: "Zusammenfassung", desc: "Eine prägnante Übersicht der wichtigsten Punkte aus Ihren Quellen" },
  { title: "Detaillierte Analyse", desc: "Eine tiefgehende Untersuchung der zentralen Themen und Argumente" },
  { title: "FAQ", desc: "Häufige Fragen und klare Antworten auf Basis Ihrer Quellen" },
  { title: "Studienleitfaden", desc: "Schlüsselkonzepte, Definitionen und Lernhilfen kompakt aufbereitet" },
];

function ctxOf(sources: Source[]) {
  return sources
    .map((s, i) => `[${i + 1}] ${s.title}\n${s.content ?? s.snippet ?? ""}`)
    .join("\n\n")
    .slice(0, 6000);
}
function parseArr(text: string): any {
  const s = text.indexOf("[");
  const e = text.lastIndexOf("]");
  if (s === -1 || e === -1) return null;
  try {
    return JSON.parse(text.slice(s, e + 1));
  } catch {
    return null;
  }
}

// GET — 4 report-format suggestions tailored to the notebook's sources.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("sources")
      .select("*")
      .eq("notebook_id", params.id)
      .order("created_at");
    const sources = (data ?? []) as Source[];
    if (!sources.length) return NextResponse.json({ formats: FALLBACK });

    const anthropic = getAnthropic();
    const prompt = `Schlage 4 passende, abwechslungsreiche Berichtsformate vor, die gut zum Inhalt der folgenden Quellen passen.

Gib AUSSCHLIESSLICH gültiges JSON in genau dieser Form zurück (keine Erklärung, keine Code-Fences):
[{"title": string, "desc": string}]
- "title": kurzer, prägnanter Formatname (2–4 Wörter).
- "desc": ein kurzer Satz, der das Format konkret in Bezug auf die Quellen beschreibt.

Quellen:
${ctxOf(sources)}`;

    const resp = await anthropic.messages.create({
      model: MODELS.structured,
      max_tokens: 700,
      messages: [{ role: "user", content: prompt }],
    });
    const text = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    const arr = parseArr(text);
    const formats =
      Array.isArray(arr) && arr.length
        ? arr.slice(0, 4).map((f: any) => ({ title: String(f.title ?? ""), desc: String(f.desc ?? "") }))
        : FALLBACK;
    return NextResponse.json({ formats });
  } catch {
    return NextResponse.json({ formats: FALLBACK });
  }
}
