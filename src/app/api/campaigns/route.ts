import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getParentCampaigns,
  createParentCampaign,
  deleteParentCampaign,
} from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const campaigns = await getParentCampaigns(user.id);
  return NextResponse.json({ campaigns });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      careCategory,
      targetChildren,
      scheduleType,
      expectedHourlyRate,
      startDate,
      notes,
      customQuestions,
      active,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Campaign title is required." },
        { status: 400 }
      );
    }

    const newCampaign = await createParentCampaign(user.id, {
      title: title.trim(),
      careCategory: careCategory || "childcare",
      targetChildren: targetChildren || [],
      scheduleType: scheduleType || "full_time",
      expectedHourlyRate: expectedHourlyRate?.trim(),
      startDate: startDate?.trim(),
      notes: notes?.trim(),
      customQuestions: customQuestions || [],
      active: active !== undefined ? Boolean(active) : true,
    });

    return NextResponse.json({ campaign: newCampaign });
  } catch (error: any) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: "Failed to create campaign." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("id");

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID required." },
        { status: 400 }
      );
    }

    const success = await deleteParentCampaign(user.id, campaignId);
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign." },
      { status: 500 }
    );
  }
}
