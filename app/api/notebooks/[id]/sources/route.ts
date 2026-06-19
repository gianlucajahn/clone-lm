import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { organizeLabels } from "@/lib/organizeLabels";
import type { SourceCandidate } from "@/lib/notebooks";

export const dynamic = "force-dynamic";

// GET /api/notebooks/[id]/sources — saved sources for the notebook.
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("sources")
      .select("*")
      .eq("notebook_id", params.id)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ sources: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}

// POST /api/notebooks/[id]/sources  { candidates: SourceCandidate[] } — import.
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase();
    const { candidates, label } = (await req.json()) as {
      candidates: SourceCandidate[];
      label?: string;
    };
    if (!Array.isArray(candidates) || candidates.length === 0) {
      return NextResponse.json({ error: "candidates required" }, { status: 400 });
    }
    const rows = candidates.map((c) => ({
      notebook_id: params.id,
      title: c.title,
      url: c.url ?? null,
      snippet: c.snippet ?? null,
      // store the snippet as grounding content for now (cheap; no full-page fetch)
      content: c.snippet ?? null,
    }));
    const { data, error } = await supabase.from("sources").insert(rows).select("*");
    if (error) throw error;

    // A web-research import (signalled by `label`) auto-organises the whole
    // notebook into sensible thematic labels — the same smart pass as the
    // "Neu organisieren" action. A failure here must not fail the import.
    const isResearch = !!(label ?? "").trim();
    if (isResearch && data && data.length) {
      try {
        await organizeLabels(params.id);
      } catch {
        /* sources are saved; the user can still organise manually */
      }
    }

    return NextResponse.json({ sources: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
