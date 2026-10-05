import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createCandidateFromPool, getAvailableNannyPoolForParents, getUserById } from "@/lib/db";
import { Child } from "@/lib/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pool = await getAvailableNannyPoolForParents();
  return NextResponse.json({ pool });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { poolCandidateId, targetChildrenIds, customQuestions } = body;

    if (!poolCandidateId) {
      return NextResponse.json({ error: "poolCandidateId is required" }, { status: 400 });
    }

    // Resolve target children for this user
    const dbUser = await getUserById(user.id);
    const userChildren = dbUser?.children || [];

    let targetChildren: Child[] = [];
    if (targetChildrenIds && Array.isArray(targetChildrenIds) && targetChildrenIds.length > 0) {
      targetChildren = userChildren.filter((k) => targetChildrenIds.includes(k.id));
    }

    if (targetChildren.length === 0 && userChildren.length > 0) {
      targetChildren = [userChildren[0]];
    }

    const candidate = await createCandidateFromPool(
      user.id,
      poolCandidateId,
      targetChildren,
      customQuestions || []
    );

    if (!candidate) {
      return NextResponse.json({ error: "Nanny profile not found in pool" }, { status: 404 });
    }

    return NextResponse.json({ success: true, candidate }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to invite nanny" }, { status: 500 });
  }
}
