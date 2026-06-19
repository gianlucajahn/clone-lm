import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// DELETE /api/notebooks/[id]/notes/[nid]
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; nid: string } }
) {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("artifacts")
      .delete()
      .eq("id", params.nid)
      .eq("notebook_id", params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
