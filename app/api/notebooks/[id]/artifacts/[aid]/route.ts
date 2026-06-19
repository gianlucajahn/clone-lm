import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET — full artifact (with data) for the detail viewer.
export async function GET(
  _req: Request,
  { params }: { params: { id: string; aid: string } }
) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("artifacts")
      .select("id, kind, title, data, created_at")
      .eq("id", params.aid)
      .eq("notebook_id", params.id)
      .single();
    if (error || !data) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({
      artifact: {
        id: data.id,
        kind: data.kind,
        title: data.title,
        data: data.data,
        created_at: data.created_at,
        sourceCount: data.data?.sourceCount ?? null,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}

// PATCH — update an artifact's title and/or data (used by the note editor).
export async function PATCH(
  req: Request,
  { params }: { params: { id: string; aid: string } }
) {
  try {
    const supabase = getSupabase();
    const body = await req.json();
    const patch: Record<string, unknown> = {};
    if (typeof body.title === "string") patch.title = body.title;
    if (body.data !== undefined) patch.data = body.data;

    const { data, error } = await supabase
      .from("artifacts")
      .update(patch)
      .eq("id", params.aid)
      .eq("notebook_id", params.id)
      .select("id, kind, title, data, created_at")
      .single();
    if (error || !data) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({
      artifact: {
        id: data.id,
        kind: data.kind,
        title: data.title,
        data: data.data,
        created_at: data.created_at,
        sourceCount: data.data?.sourceCount ?? null,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}

// DELETE an artifact (also used for notes).
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; aid: string } }
) {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("artifacts")
      .delete()
      .eq("id", params.aid)
      .eq("notebook_id", params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
