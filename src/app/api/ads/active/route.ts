import { NextRequest, NextResponse } from "next/server";
import { getAdsForAge, trackAdImpression } from "@/lib/db";
import { AdPlacement } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ageStr = searchParams.get("age");
  const placement = searchParams.get("placement") as AdPlacement | null;
  const careCategory = searchParams.get("careCategory") as any;

  const age = ageStr ? parseInt(ageStr, 10) : 3;
  const ads = await getAdsForAge(age, placement || undefined, careCategory || undefined);

  // Automatically count impression asynchronously for returned ads
  ads.forEach((ad) => {
    trackAdImpression(ad.id).catch(() => {});
  });

  return NextResponse.json({ ads });
}
