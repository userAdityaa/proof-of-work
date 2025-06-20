import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) { 
    try { 
        const { searchParams } = new URL(request.url);
        const sortBy = searchParams.get("sortBy") || "participant_score";

        if (!["participant_score", "creator_score"].includes(sortBy)) {
            return NextResponse.json(
                { error: "Invalid sortBy parameter" },
                { status: 400 }
            );
        }

        const users = await prisma.user.findMany({
            orderBy: {
                [sortBy]: "desc",
            },
        });

        return NextResponse.json({ users }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

