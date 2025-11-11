import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const canvasStateSchema = z.object({
    state: z.any(), // TLDraw snapshot can be any JSON structure
});

// GET /api/projects/[id]/canvas - Load canvas state
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify user has access to this project
        const project = await prisma.project.findUnique({
            where: {
                id: params.id,
            },
            include: {
                canvas: true,
                team: {
                    include: {
                        members: {
                            where: {
                                userId: session.user.id,
                            },
                        },
                    },
                },
            },
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Check access: personal project creator or team member
        const hasAccess = !project.teamId
            ? project.createdById === session.user.id
            : project.team?.members && project.team.members.length > 0;

        if (!hasAccess) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Return canvas state or empty state if not exists
        if (project.canvas) {
            return NextResponse.json({
                id: project.canvas.id,
                state: project.canvas.state,
                version: project.canvas.version,
            });
        }

        return NextResponse.json({
            state: null,
            version: 0,
        });
    } catch (error) {
        console.error('Error loading canvas state:', error);
        return NextResponse.json(
            { error: 'Failed to load canvas state' },
            { status: 500 }
        );
    }
}

// POST /api/projects/[id]/canvas - Save canvas state
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify user has access to this project and has editor/owner role
        const project = await prisma.project.findUnique({
            where: {
                id: params.id,
            },
            include: {
                canvas: true,
                team: {
                    include: {
                        members: {
                            where: {
                                userId: session.user.id,
                            },
                        },
                    },
                },
            },
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Check access and permissions
        let hasWriteAccess = false;
        if (!project.teamId) {
            // Personal project: only creator can edit
            hasWriteAccess = project.createdById === session.user.id;
        } else {
            // Team project: check role
            const member = project.team?.members[0];
            hasWriteAccess = member && (member.role === 'OWNER' || member.role === 'EDITOR');
        }

        if (!hasWriteAccess) {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validatedData = canvasStateSchema.parse(body);

        // Update or create canvas
        const canvas = await prisma.canvas.upsert({
            where: {
                projectId: params.id,
            },
            update: {
                state: validatedData.state,
                version: {
                    increment: 1,
                },
            },
            create: {
                projectId: params.id,
                state: validatedData.state,
                version: 1,
            },
        });

        return NextResponse.json({
            id: canvas.id,
            version: canvas.version,
            message: 'Canvas state saved successfully',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Error saving canvas state:', error);
        return NextResponse.json(
            { error: 'Failed to save canvas state' },
            { status: 500 }
        );
    }
}
