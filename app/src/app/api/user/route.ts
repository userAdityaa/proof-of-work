import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { id, name, avatar_url, participant_score, creator_score } = await request.json();

    if (!id || !name || participant_score === undefined || creator_score === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: id, name, participant_score or creator_score" },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        id, 
        name,
        avatar_url,
        participant_score,
        creator_score,
      },
    });

    return NextResponse.json({ message: "User created", user }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}