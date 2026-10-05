import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getUserQuestionBank,
  addQuestionToBank,
  deleteQuestionFromBank,
} from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const groups = await getUserQuestionBank(user.id);
  return NextResponse.json({ groups });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { prompt, promptEs, type, options, optionsEs, required, groupId, groupNameEs, groupNameEn } = body;

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: "Question prompt is required." },
        { status: 400 }
      );
    }

    const newItem = await addQuestionToBank(user.id, {
      userId: user.id,
      groupId: groupId || "grp_user_saved",
      groupNameEs: groupNameEs || "⭐ Mis Preguntas Guardadas",
      groupNameEn: groupNameEn || "⭐ My Saved Questions",
      type: type === "multiple_choice" ? "multiple_choice" : "open_text",
      prompt: prompt.trim(),
      promptEs: promptEs?.trim() || prompt.trim(),
      options: type === "multiple_choice" ? options || [] : undefined,
      optionsEs: type === "multiple_choice" ? optionsEs || options || [] : undefined,
      required: Boolean(required),
      isCustomUser: true,
    });

    return NextResponse.json({ item: newItem });
  } catch (error: any) {
    console.error("Error adding question to bank:", error);
    return NextResponse.json(
      { error: "Failed to add question to bank." },
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
    const questionId = searchParams.get("id");

    if (!questionId) {
      return NextResponse.json(
        { error: "Question ID required." },
        { status: 400 }
      );
    }

    const success = await deleteQuestionFromBank(user.id, questionId);
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error("Error deleting question from bank:", error);
    return NextResponse.json(
      { error: "Failed to delete question from bank." },
      { status: 500 }
    );
  }
}
