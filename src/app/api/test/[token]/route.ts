import { NextRequest, NextResponse } from "next/server";
import { getCandidateByToken, saveCandidateSubmission } from "@/lib/db";
import { ASSESSMENT_QUESTIONS } from "@/lib/questions";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const candidate = await getCandidateByToken(token);

  if (!candidate) {
    return NextResponse.json({ error: "Invalid or expired test link." }, { status: 404 });
  }

  // Determine if candidate is in a multi-child or sibling campaign
  const roleLower = (candidate.roleTarget || "").toLowerCase();
  const isMultiChild =
    (candidate.targetChildren && candidate.targetChildren.length > 1) ||
    (!candidate.targetChildren && (
      roleLower.includes("&") ||
      roleLower.includes(" y ") ||
      roleLower.includes("hermanos") ||
      roleLower.includes("siblings")
    ));

  const relevantQuestions = ASSESSMENT_QUESTIONS.filter((q) => {
    if (q.category === "sibling_and_multichild") {
      return isMultiChild;
    }
    return true;
  });

  // Sanitize questions so candidate cannot see score values or redFlag hints in browser inspect tools
  const sanitizedQuestions = relevantQuestions.map((q) => ({
    id: q.id,
    category: q.category,
    categoryTitle: q.categoryTitle,
    categoryTitleEs: q.categoryTitleEs || q.categoryTitle,
    question: q.question,
    questionEs: q.questionEs || q.question,
    context: q.context,
    contextEs: q.contextEs || q.context,
    type: q.type,
    options: q.options.map((opt) => ({
      id: opt.id,
      text: opt.text,
      textEs: opt.textEs || opt.text,
    })),
  }));

  return NextResponse.json({
    candidate: {
      id: candidate.id,
      name: candidate.name,
      roleTarget: candidate.roleTarget,
      targetChildren: candidate.targetChildren,
      askHourlyRate: candidate.askHourlyRate !== false,
      status: candidate.status,
      alreadyCompleted: candidate.status === "completed",
      customQuestions: candidate.customQuestions || [],
    },
    questions: sanitizedQuestions,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const candidate = await getCandidateByToken(token);

  if (!candidate) {
    return NextResponse.json({ error: "Invalid test token." }, { status: 404 });
  }

  try {
    const { profile, responses, customAnswers } = await req.json();

    if (!profile || !profile.fullName || !responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: "Candidate profile and assessment responses are required." },
        { status: 400 }
      );
    }

    const updated = await saveCandidateSubmission(
      token,
      profile,
      responses,
      Array.isArray(customAnswers) ? customAnswers : []
    );

    return NextResponse.json({
      success: true,
      candidate: {
        id: updated?.id,
        name: updated?.name,
        status: updated?.status,
        completedAt: updated?.result?.completedAt,
      },
    });
  } catch (error: any) {
    console.error("Error saving assessment submission:", error);
    return NextResponse.json(
      { error: "Failed to process and record assessment answers." },
      { status: 500 }
    );
  }
}
