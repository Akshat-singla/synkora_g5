import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GitHubClient } from "@/lib/github-client";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check if user has GitHub access token
        if (!session.githubAccessToken) {
            return NextResponse.json(
                { error: "GitHub account not connected. Please sign in with GitHub." },
                { status: 403 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1");
        const perPage = parseInt(searchParams.get("perPage") || "30");

        // Create GitHub client and fetch user's repositories
        const githubClient = new GitHubClient(session.githubAccessToken);
        const result = await githubClient.listUserRepositories({
            page,
            perPage,
        });

        return NextResponse.json({
            repositories: result.repositories,
            hasMore: result.hasMore,
            page,
            perPage,
        });
    } catch (error) {
        console.error("Error fetching user repositories:", error);
        return NextResponse.json(
            { error: "Failed to fetch repositories" },
            { status: 500 }
        );
    }
}
