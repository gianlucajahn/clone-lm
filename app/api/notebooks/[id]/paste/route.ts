import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// POST { text } — save pasted clipboard text as a "Kopierter Text N" source.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { text } = await req.json();
    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Kein Text empfangen." }, { status: 400 });
    }

    const supabase = getSupabase();
    const { count } = await supabase
      .from("sources")
      .select("*", { count: "exact", head: true })
      .eq("notebook_id", params.id)
      .ilike("title", "Kopierter Text%");

    const n = (count ?? 0) + 1;
    const clean = text.trim();

    const { data: row, error } = await supabase
      .from("sources")
      .insert({
        notebook_id: params.id,
        title: `Kopierter Text ${n}`,
        url: null,
        snippet: clean.slice(0, 400),
        content: clean,
      })
      .select("*")
      .single();
    if (error) throw error;

    return NextResponse.json({ source: row });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
