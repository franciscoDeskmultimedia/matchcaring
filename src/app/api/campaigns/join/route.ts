import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { joinParentCampaignByCode } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { code } = body;

    if (!code?.trim()) {
      return NextResponse.json(
        { error: "Campaign share code is required." },
        { status: 400 }
      );
    }

    const result = await joinParentCampaignByCode(
      code.trim(),
      user.id,
      user.email
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || "Failed to join campaign." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, campaign: result.campaign });
  } catch (error: any) {
    console.error("Error joining campaign:", error);
    return NextResponse.json(
      { error: "Internal server error joining campaign." },
      { status: 500 }
    );
  }
}
