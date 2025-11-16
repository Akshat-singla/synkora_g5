import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GitHubClient } from "@/lib/github-client";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        console.log("[GitHub Repositories API] Session check:", {
            hasSession: !!session,
            hasUser: !!session?.user,
            userId: session?.user?.id,
            hasGitHubToken: !!session?.githubAccessToken,
        });

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check if user has GitHub access token
        if (!session.githubAccessToken) {
            console.log("[GitHub Repositories API] No GitHub access token found for user:", session.user.id);
            return NextResponse.json(
                { error: "GitHub account not connected. Please sign in with GitHub." },
                { status: 403 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1");
        const perPage = parseInt(searchParams.get("perPage") || "30");

        console.log("[GitHub Repositories API] Fetching repositories for user:", session.user.id, {
            page,
            perPage,
        });

        // Create GitHub client and fetch user's repositories
        const githubClient = new GitHubClient(session.githubAccessToken);
        const result = await githubClient.listUserRepositories({
            page,
            perPage,
        });

        console.log("[GitHub Repositories API] Successfully fetched repositories:", {
            count: result.repositories.length,
            hasMore: result.hasMore,
        });

        return NextResponse.json({
            repositories: result.repositories,
            hasMore: result.hasMore,
            page,
            perPage,
        });
    } catch (error: any) {
        console.error("[GitHub Repositories API] Error fetching user repositories:", {
            error: error.message,
            stack: error.stack,
            response: error.response?.data,
            status: error.status,
        });

        // Check if it's an authentication error
        if (error.status === 401 || error.message?.includes("Bad credentials")) {
            return NextResponse.json(
                {error: "GitHub authentication failed. Please reconnect your GitHub account."},
                {status: 401}
            );
        }

        return NextResponse.json(
            {
                error: "Failed to fetch repositories",
                details: error.message
            },
            { status: 500 }
        );
    }
}
