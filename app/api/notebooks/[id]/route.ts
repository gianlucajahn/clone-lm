import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/notebooks/[id] — notebook + its sources + chat history.
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase();
    const { id } = params;

    const [{ data: notebook, error: nErr }, { data: sources }, { data: messages }] =
      await Promise.all([
        supabase.from("notebooks").select("*").eq("id", id).single(),
        supabase
          .from("sources")
          .select("*")
          .eq("notebook_id", id)
          .order("created_at", { ascending: true }),
        supabase
          .from("chat_messages")
          .select("*")
          .eq("notebook_id", id)
          .order("created_at", { ascending: true }),
      ]);

    if (nErr || !notebook) {
      return NextResponse.json({ error: "Notebook not found" }, { status: 404 });
    }
    return NextResponse.json({
      notebook,
      sources: sources ?? [],
      messages: messages ?? [],
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}

// PATCH /api/notebooks/[id] — rename (and/or set summary).
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase();
    const body = await req.json();
    const patch: Record<string, unknown> = {};
    if (typeof body.title === "string") patch.title = body.title;
    if (typeof body.summary === "string") patch.summary = body.summary;

    const { data, error } = await supabase
      .from("notebooks")
      .update(patch)
      .eq("id", params.id)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ notebook: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}

// DELETE /api/notebooks/[id] — explicitly removes all child rows first, then the
// notebook itself, so deletion works regardless of whether the DB foreign keys
// were created with ON DELETE CASCADE. (Without this, deleting a notebook that
// has sources/artifacts/messages fails on the FK constraint and the row
// silently survives.)
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase();
    const { id } = params;

    for (const table of ["chat_messages", "sources", "artifacts"] as const) {
      const { error } = await supabase.from(table).delete().eq("notebook_id", id);
      if (error) throw error;
    }

    const { error } = await supabase.from("notebooks").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
