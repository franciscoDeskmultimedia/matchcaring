import { NextRequest, NextResponse } from "next/server";
import { getPublicRecommendedProducts } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ageParam = searchParams.get("age");
  const categoryParam = searchParams.get("category");
  const careCategoryParam = searchParams.get("careCategory") as any;

  const childAge = ageParam ? parseInt(ageParam, 10) : undefined;
  const category = categoryParam || undefined;

  const data = await getPublicRecommendedProducts(childAge, category, careCategoryParam || undefined);
  return NextResponse.json(data);
}
