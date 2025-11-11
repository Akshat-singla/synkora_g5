import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const projectId = params.id;
        const body = await request.json();
        const { githubRepoId, owner, name, fullName, accessToken } = body;

        // Validate required fields
        if (!githubRepoId || !owner || !name || !fullName || !accessToken) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if user has access to the project
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                team: {
                    members: {
                        some: {
                            userId: session.user.id,
                            role: {
                                in: ["OWNER", "EDITOR"],
                            },
                        },
                    },
                },
            },
        });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found or insufficient permissions" },
                { status: 404 }
            );
        }

        // Encrypt the access token before storing
        const encryptedToken = encrypt(accessToken);

        // Create or update GitHub repository connection
        const gitRepo = await prisma.gitRepository.upsert({
            where: {
                projectId: projectId,
            },
            update: {
                githubRepoId,
                owner,
                name,
                fullName,
                accessToken: encryptedToken,
                lastSyncedAt: null, // Reset sync time
            },
            create: {
                projectId,
                githubRepoId,
                owner,
                name,
                fullName,
                accessToken: encryptedToken,
            },
        });

        return NextResponse.json({
            id: gitRepo.id,
            githubRepoId: gitRepo.githubRepoId,
            owner: gitRepo.owner,
            name: gitRepo.name,
            fullName: gitRepo.fullName,
            lastSyncedAt: gitRepo.lastSyncedAt,
        });
    } catch (error) {
        console.error("Error connecting GitHub repository:", error);
        return NextResponse.json(
            { error: "Failed to connect repository" },
            { status: 500 }
        );
    }
}
