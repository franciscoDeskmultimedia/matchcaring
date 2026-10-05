import { NextRequest, NextResponse } from "next/server";
import { trackAdClick } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { adId } = await req.json();
    if (adId) {
      await trackAdClick(adId);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
