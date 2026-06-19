import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/notebooks — list newest-first with a source count per notebook.
export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("notebooks")
      .select("id, title, summary, created_at, sources(count)")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const notebooks = (data ?? []).map((n: any) => ({
      id: n.id,
      title: n.title,
      summary: n.summary,
      created_at: n.created_at,
      source_count: n.sources?.[0]?.count ?? 0,
    }));
    return NextResponse.json({ notebooks });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}

// POST /api/notebooks — create an empty notebook.
export async function POST() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("notebooks")
      .insert({ title: "Unbenanntes Notebook" })
      .select("id, title, summary, created_at")
      .single();
    if (error) throw error;
    return NextResponse.json({ notebook: { ...data, source_count: 0 } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
