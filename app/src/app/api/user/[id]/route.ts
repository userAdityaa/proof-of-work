// app/api/users/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, participant_score, creator_score } = await request.json();
    const id = parseInt(params.id);

    // Validate input
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: name ?? undefined,
        participant_score: participant_score ?? undefined,
        creator_score: creator_score ?? undefined,
      },
    });

    return NextResponse.json(
      { message: "User updated", user },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update user or user not found" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}