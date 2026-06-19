import { NextResponse } from "next/server";
import { organizeLabels } from "@/lib/organizeLabels";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// POST — let the model sort every source into the best thematic label, reusing
// existing labels where they fit and inventing new ones where needed.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    return NextResponse.json(await organizeLabels(params.id));
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? String(e) }, { status: 500 });
  }
}
