import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import type { LabelConfig } from "@/lib/labels";

export const dynamic = "force-dynamic";

function emptyConfig(): LabelConfig {
  return { labels: [], assignments: {} };
}

// GET — the label config (categories + per-source assignments) for a notebook.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("artifacts")
      .select("data")
      .eq("notebook_id", params.id)
      .eq("kind", "labels")
      .maybeSingle();
    const cfg = (data?.data as LabelConfig | undefined) ?? emptyConfig();
    return NextResponse.json({
      labels: cfg.labels ?? [],
      assignments: cfg.assignments ?? {},
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}

// PUT — replace the whole label config.
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = (await req.json()) as Partial<LabelConfig>;
    const cfg: LabelConfig = {
      labels: Array.isArray(body.labels) ? body.labels : [],
      assignments: body.assignments && typeof body.assignments === "object" ? body.assignments : {},
    };
    const supabase = getSupabase();
    await supabase.from("artifacts").delete().eq("notebook_id", params.id).eq("kind", "labels");
    const { error } = await supabase.from("artifacts").insert({
      notebook_id: params.id,
      kind: "labels",
      title: "labels",
      data: cfg,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
