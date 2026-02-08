/**
 * Canvas State API
 * 
 * Handles saving and loading canvas state for persistence
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/canvas/[id]
 * Get canvas state
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const canvasId = params.id;

        const canvas = await prisma.canvas.findUnique({
            where: { id: canvasId },
            select: {
                id: true,
                state: true,
                version: true,
            },
        });

        if (!canvas) {
            return NextResponse.json({ error: 'Canvas not found' }, { status: 404 });
        }

        return NextResponse.json(canvas);
    } catch (error: any) {
        console.error('Error fetching canvas:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch canvas' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/canvas/[id]
 * Update canvas state
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const canvasId = params.id;
        const body = await request.json();

        // Update canvas state
        const canvas = await prisma.canvas.update({
            where: { id: canvasId },
            data: {
                state: body.state || {},
                version: {
                    increment: 1,
                },
            },
            select: {
                id: true,
                state: true,
                version: true,
            },
        });

        return NextResponse.json(canvas);
    } catch (error: any) {
        console.error('Error updating canvas:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update canvas' },
            { status: 500 }
        );
    }
}
