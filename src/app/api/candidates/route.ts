import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createCandidate, getCandidatesByUserId } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const candidates = await getCandidatesByUserId(user.id);
  return NextResponse.json({ candidates });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      name,
      roleTarget,
      targetChildren,
      askHourlyRate,
      phone,
      email,
      parentNotes,
      customQuestions,
    } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Candidate name is required." },
        { status: 400 }
      );
    }

    const childName = user.childProfile?.name || "Child";
    const defaultRole = `Full-Time Nanny for 3yo ${childName}`;

    const candidate = await createCandidate({
      userId: user.id,
      name: name.trim(),
      roleTarget: roleTarget?.trim() || defaultRole,
      targetChildren,
      askHourlyRate: askHourlyRate !== undefined ? Boolean(askHourlyRate) : true,
      phone: phone?.trim(),
      email: email?.trim(),
      parentNotes: parentNotes?.trim(),
      customQuestions: Array.isArray(customQuestions) ? customQuestions : [],
    });

    return NextResponse.json({ candidate });
  } catch (error: any) {
    console.error("Error creating candidate invitation:", error);
    return NextResponse.json(
      { error: "Failed to create candidate invitation." },
      { status: 500 }
    );
  }
}
