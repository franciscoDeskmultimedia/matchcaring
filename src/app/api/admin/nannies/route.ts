import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getNannyTalentPool, updateCandidateTalentPool } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
  }

  const pool = await getNannyTalentPool();
  return NextResponse.json({ pool });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
  }

  try {
    const { candidateId, inTalentPool, talentPoolStatus } = await req.json();
    if (!candidateId) {
      return NextResponse.json({ error: "candidateId is required" }, { status: 400 });
    }

    const updated = await updateCandidateTalentPool(candidateId, inTalentPool, talentPoolStatus);
    if (!updated) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    return NextResponse.json({ candidate: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update candidate" }, { status: 500 });
  }
}
