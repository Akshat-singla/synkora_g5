import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/projects/[id]/export
 * Export all project data including components, decisions, canvas state, etc.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const projectId = params.id;

        // Verify project exists and user has access
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                canvas: {
                    include: {
                        components: {
                            include: {
                                decisionComponents: {
                                    include: {
                                        decision: {
                                            include: {
                                                supersededByRecord: true,
                                                supersedesRecords: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                team: {
                    include: {
                        members: {
                            where: {
                                userId: session.user.id,
                            },
                        },
                    },
                },
                decisionRecords: {
                    include: {
                        supersededByRecord: true,
                        supersedesRecords: true,
                    },
                },
            },
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        // Check access
        const hasAccess = !project.teamId
            ? project.createdById === session.user.id
            : project.team?.members && project.team.members.length > 0;

        if (!hasAccess) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        // Prepare export data
        const exportData = {
            project: {
                id: project.id,
                name: project.name,
                description: project.description,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
            },
            canvas: project.canvas ? {
                id: project.canvas.id,
                state: project.canvas.state,
                version: project.canvas.version,
            } : null,
            components: project.canvas?.components.map(component => ({
                id: component.id,
                componentId: component.componentId,
                name: component.name,
                type: component.type,
                description: component.description,
                position: component.position,
                metadata: component.metadata,
                linkedDecisions: component.decisionComponents.map(dc => ({
                    id: dc.decision.id,
                    title: dc.decision.title,
                    status: dc.decision.status,
                    context: dc.decision.context,
                    decision: dc.decision.decision,
                    rationale: dc.decision.rationale,
                    consequences: dc.decision.consequences,
                    tags: dc.decision.tags,
                    createdAt: dc.decision.createdAt,
                    updatedAt: dc.decision.updatedAt,
                    supersededById: dc.decision.supersededBy,
                })),
            })) || [],
            decisions: project.decisionRecords.map(decision => ({
                id: decision.id,
                title: decision.title,
                status: decision.status,
                context: decision.context,
                decision: decision.decision,
                rationale: decision.rationale,
                consequences: decision.consequences,
                tags: decision.tags,
                createdAt: decision.createdAt,
                updatedAt: decision.updatedAt,
                supersededById: decision.supersededBy,
                supersedesId: decision.supersedes,
            })),
            exportedAt: new Date().toISOString(),
            exportedBy: session.user.email,
        };

        // Return as JSON with appropriate headers for download
        return new NextResponse(JSON.stringify(exportData, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="${project.name.replace(/[^a-z0-9]/gi, '_')}_export_${new Date().toISOString().split('T')[0]}.json"`,
            },
        });
    } catch (error) {
        console.error('Error exporting project:', error);
        return NextResponse.json(
            { error: 'Failed to export project' },
            { status: 500 }
        );
    }
}
