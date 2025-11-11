import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";

/**
 * Get the current user session on the server
 */
export async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    return session?.user;
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("Unauthorized");
    }
    return user;
}

/**
 * Check if user has access to a team
 */
export async function checkTeamAccess(userId: string, teamId: string) {
    const teamMember = await prisma.teamMember.findUnique({
        where: {
            teamId_userId: {
                teamId,
                userId,
            },
        },
    });

    return teamMember;
}

/**
 * Check if user has access to a project
 */
export async function checkProjectAccess(userId: string, projectId: string) {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            team: {
                include: {
                    members: {
                        where: { userId },
                    },
                },
            },
        },
    });

    if (!project) {
        return null;
    }

    const teamMember = project.team.members[0];
    return teamMember ? { project, role: teamMember.role } : null;
}

/**
 * Require specific role for team access
 */
export async function requireTeamRole(
    userId: string,
    teamId: string,
    requiredRoles: Role[]
) {
    const teamMember = await checkTeamAccess(userId, teamId);

    if (!teamMember) {
        throw new Error("Access denied: Not a team member");
    }

    if (!requiredRoles.includes(teamMember.role)) {
        throw new Error("Access denied: Insufficient permissions");
    }

    return teamMember;
}

/**
 * Require specific role for project access
 */
export async function requireProjectRole(
    userId: string,
    projectId: string,
    requiredRoles: Role[]
) {
    const access = await checkProjectAccess(userId, projectId);

    if (!access) {
        throw new Error("Access denied: Not a project member");
    }

    if (!requiredRoles.includes(access.role)) {
        throw new Error("Access denied: Insufficient permissions");
    }

    return access;
}

/**
 * Check if user can edit (Owner or Editor role)
 */
export function canEdit(role: Role): boolean {
    return role === Role.OWNER || role === Role.EDITOR;
}

/**
 * Check if user is owner
 */
export function isOwner(role: Role): boolean {
    return role === Role.OWNER;
}

/**
 * Check if user can view (any role)
 */
export function canView(role: Role): boolean {
    return role === Role.OWNER || role === Role.EDITOR || role === Role.VIEWER;
}
