import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// GET — the notebook's cover banner (a data-URL stored as a kind='cover' artifact).
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("artifacts")
      .select("data")
      .eq("notebook_id", params.id)
      .eq("kind", "cover")
      .maybeSingle();
    return NextResponse.json({ cover: data?.data?.image ?? null });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}

// PUT { image } — set/replace the cover banner (singleton per notebook).
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { image } = await req.json();
    if (typeof image !== "string" || !image.startsWith("data:image")) {
      return NextResponse.json({ error: "image required" }, { status: 400 });
    }
    const supabase = getSupabase();
    await supabase
      .from("artifacts")
      .delete()
      .eq("notebook_id", params.id)
      .eq("kind", "cover");
    const { error } = await supabase.from("artifacts").insert({
      notebook_id: params.id,
      kind: "cover",
      title: "cover",
      data: { image },
    });
    if (error) throw error;
    return NextResponse.json({ cover: image });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
