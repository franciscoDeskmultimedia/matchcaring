import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { shareParentCampaign } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { campaignId, email } = body;

    if (!campaignId || !email?.trim()) {
      return NextResponse.json(
        { error: "Campaign ID and collaborator email are required." },
        { status: 400 }
      );
    }

    const result = await shareParentCampaign(campaignId, email.trim(), user.id);
    if (!result.success) {
      return NextResponse.json(
        { error: result.message || "Failed to share campaign." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, campaign: result.campaign });
  } catch (error: any) {
    console.error("Error sharing campaign:", error);
    return NextResponse.json(
      { error: "Internal server error sharing campaign." },
      { status: 500 }
    );
  }
}
