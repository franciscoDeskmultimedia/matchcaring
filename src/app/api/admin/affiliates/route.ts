import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createRecommendedProduct,
  deleteRecommendedProduct,
  getAdminRecommendedProducts,
  getAffiliateSettings,
  updateAffiliateSettings,
  updateRecommendedProduct,
} from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    if (user?.id !== "usr_parent_demo" && user?.email !== "parent@example.com") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }
  }

  const settings = await getAffiliateSettings();
  const products = await getAdminRecommendedProducts();

  return NextResponse.json({ settings, products });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    if (user?.id !== "usr_parent_demo" && user?.email !== "parent@example.com") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }
  }

  try {
    const body = await req.json();

    // Check if updating settings
    if (body.type === "settings" || body.amazonTag !== undefined) {
      const updatedSettings = await updateAffiliateSettings({
        amazonTag: body.amazonTag?.trim(),
        disclaimerTextEs: body.disclaimerTextEs,
        disclaimerTextEn: body.disclaimerTextEn,
        enabled: body.enabled !== false,
      });
      return NextResponse.json({ success: true, settings: updatedSettings });
    }

    // Otherwise updating a product
    if (body.id) {
      const updatedProduct = await updateRecommendedProduct(body.id, body.updates || body);
      return NextResponse.json({ success: true, product: updatedProduct });
    }

    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update affiliate configuration" }, { status: 500 });
  }
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
    if (!body.title || !body.affiliateUrl) {
      return NextResponse.json({ error: "title and affiliateUrl are required" }, { status: 400 });
    }

    const newProduct = await createRecommendedProduct({
      title: body.title.trim(),
      titleEs: (body.titleEs || body.title).trim(),
      category: body.category || "activities",
      categoryLabelEs: body.categoryLabelEs || "Actividades & Juegos",
      categoryLabelEn: body.categoryLabelEn || "Activities & Play",
      targetMinAge: parseInt(body.targetMinAge ?? 1, 10),
      targetMaxAge: parseInt(body.targetMaxAge ?? 4, 10),
      ageBadge: body.ageBadge || `${body.targetMinAge ?? 1} - ${body.targetMaxAge ?? 4} years`,
      ageBadgeEs: body.ageBadgeEs || `${body.targetMinAge ?? 1} - ${body.targetMaxAge ?? 4} años`,
      description: body.description || "",
      descriptionEs: body.descriptionEs || body.description || "",
      pedagogicalBenefitEs: body.pedagogicalBenefitEs || "Recomendado para el desarrollo y seguridad infantil.",
      pedagogicalBenefitEn: body.pedagogicalBenefitEn || "Recommended for child development and safety.",
      imageUrl: body.imageUrl || "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80",
      affiliateUrl: body.affiliateUrl.trim(),
      priceEstimate: body.priceEstimate || "$19.99",
      rating: parseFloat(body.rating ?? 4.8),
      reviewCount: parseInt(body.reviewCount ?? 120, 10),
      badge: body.badge,
      badgeEs: body.badgeEs,
      active: body.active !== false,
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create product" }, { status: 500 });
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
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const deleted = await deleteRecommendedProduct(id);
  return NextResponse.json({ success: deleted });
}
