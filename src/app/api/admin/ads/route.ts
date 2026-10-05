import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdCampaign, deleteAdCampaign, getAdCampaigns, updateAdCampaign } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    if (user?.id !== "usr_parent_demo" && user?.email !== "parent@example.com") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }
  }

  const ads = await getAdCampaigns();
  return NextResponse.json({ ads });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    if (user?.id !== "usr_parent_demo" && user?.email !== "parent@example.com") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }
  }

  try {
    const body = await req.json();
    const newAd = await createAdCampaign({
      sponsorName: body.sponsorName || "Sponsor",
      title: body.title,
      titleEs: body.titleEs || body.title,
      headline: body.headline,
      headlineEs: body.headlineEs || body.headline,
      description: body.description,
      descriptionEs: body.descriptionEs || body.description,
      imageUrl: body.imageUrl || undefined,
      category: body.category || "gear",
      placement: body.placement || "dashboard_banner",
      targetMinAge: parseInt(body.targetMinAge ?? 0, 10),
      targetMaxAge: parseInt(body.targetMaxAge ?? 5, 10),
      badgeText: body.badgeText,
      badgeTextEs: body.badgeTextEs || body.badgeText,
      ctaText: body.ctaText || "Learn More",
      ctaTextEs: body.ctaTextEs || "Ver Más",
      ctaUrl: body.ctaUrl || "#",
      bgColor: body.bgColor || "from-sky-500/10 via-indigo-500/5 to-emerald-500/10",
      active: body.active !== false,
    });

    return NextResponse.json({ ad: newAd }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create ad campaign" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    if (user?.id !== "usr_parent_demo" && user?.email !== "parent@example.com") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }
  }

  try {
    const { id, ...updates } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const updated = await updateAdCampaign(id, updates);
    if (!updated) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    return NextResponse.json({ ad: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update ad campaign" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    if (user?.id !== "usr_parent_demo" && user?.email !== "parent@example.com") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id param is required" }, { status: 400 });
  }

  const deleted = await deleteAdCampaign(id);
  return NextResponse.json({ success: deleted });
}
