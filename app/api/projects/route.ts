import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createProjectSchema = z.object({
    name: z.string().min(1, "Project name is required").max(100),
    description: z.string().max(500).optional(),
    teamId: z.string().optional(),
});

// GET /api/projects - List user's projects
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get all teams the user is a member of
        const teamMemberships = await prisma.teamMember.findMany({
            where: {
                userId: session.user.id,
            },
            select: {
                teamId: true,
            },
        });

        const teamIds = teamMemberships.map((tm: { teamId: string }) => tm.teamId);

        // Get all projects from those teams AND personal projects created by the user
        const projects = await prisma.project.findMany({
            where: {
                OR: [
                    {
                        teamId: {
                            in: teamIds,
                        },
                    },
                    {
                        teamId: null,
                        createdById: session.user.id,
                    },
                ],
            },
            include: {
                team: {
                    include: {
                        members: {
                            select: {
                                id: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        tasks: true,
                    },
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        return NextResponse.json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        return NextResponse.json(
            { error: "Failed to fetch projects" },
            { status: 500 }
        );
    }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = createProjectSchema.parse(body);

        // Normalize empty string to undefined
        const teamId = validatedData.teamId && validatedData.teamId.trim() !== "" ? validatedData.teamId : undefined;

        // If teamId is provided, check if user is a member of the team
        if (teamId) {
            const teamMember = await prisma.teamMember.findUnique({
                where: {
                    teamId_userId: {
                        teamId: teamId,
                        userId: session.user.id,
                    },
                },
            });

            if (!teamMember) {
                return NextResponse.json(
                    { error: "You are not a member of this team" },
                    { status: 403 }
                );
            }

            // Check if user has permission to create projects (OWNER or EDITOR)
            if (teamMember.role === "VIEWER") {
                return NextResponse.json(
                    { error: "You don't have permission to create projects" },
                    { status: 403 }
                );
            }
        }

        // Create the project
        const project = await prisma.project.create({
            data: {
                name: validatedData.name,
                description: validatedData.description || null,
                teamId: teamId || null,
                createdById: session.user.id,
            },
            include: {
                team: teamId ? {
                    include: {
                        members: {
                            select: {
                                id: true,
                            },
                        },
                    },
                } : false,
                _count: {
                    select: {
                        tasks: true,
                    },
                },
            },
        });

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input", details: error.issues },
                { status: 400 }
            );
        }

        console.error("Error creating project:", error);
        return NextResponse.json(
            { error: "Failed to create project" },
            { status: 500 }
        );
    }
}
