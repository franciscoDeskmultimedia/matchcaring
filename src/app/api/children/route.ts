import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addUserChild, deleteUserChild, getUserChildren } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const children = await getUserChildren(user.id);
  return NextResponse.json({ children });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, age, notes } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Child name is required." },
        { status: 400 }
      );
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      return NextResponse.json(
        { error: "Valid age between 0 and 120 is required." },
        { status: 400 }
      );
    }

    const newChild = await addUserChild(user.id, {
      name: name.trim(),
      age: ageNum,
      notes: notes?.trim(),
    });

    return NextResponse.json({ child: newChild });
  } catch (error: any) {
    console.error("Error adding child:", error);
    return NextResponse.json(
      { error: "Failed to add child to family profile." },
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
    const childId = searchParams.get("id");

    if (!childId) {
      return NextResponse.json({ error: "Child ID required." }, { status: 400 });
    }

    const success = await deleteUserChild(user.id, childId);
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error("Error deleting child:", error);
    return NextResponse.json(
      { error: "Failed to delete child." },
      { status: 500 }
    );
  }
}
