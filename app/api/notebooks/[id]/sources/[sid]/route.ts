import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// PATCH /api/notebooks/[id]/sources/[sid]  { title } — rename a source
export async function PATCH(
  req: Request,
  { params }: { params: { id: string; sid: string } }
) {
  try {
    const { title } = await req.json();
    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "title required" }, { status: 400 });
    }
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("sources")
      .update({ title: title.trim().slice(0, 200) })
      .eq("id", params.sid)
      .eq("notebook_id", params.id)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ source: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}

// DELETE /api/notebooks/[id]/sources/[sid]
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; sid: string } }
) {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("sources")
      .delete()
      .eq("id", params.sid)
      .eq("notebook_id", params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
