import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteCandidate, getCandidateById, updateCandidate } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const candidate = await getCandidateById(id);

  if (!candidate || candidate.userId !== user.id) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  return NextResponse.json({ candidate });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const candidate = await getCandidateById(id);

  if (!candidate || candidate.userId !== user.id) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const allowedUpdates: any = {};

    if (body.status !== undefined) allowedUpdates.status = body.status;
    if (body.parentNotes !== undefined) allowedUpdates.parentNotes = body.parentNotes;

    const updated = await updateCandidate(id, allowedUpdates);
    return NextResponse.json({ candidate: updated });
  } catch (error: any) {
    console.error("Error updating candidate:", error);
    return NextResponse.json(
      { error: "Failed to update candidate." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const success = await deleteCandidate(id, user.id);

  if (!success) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
