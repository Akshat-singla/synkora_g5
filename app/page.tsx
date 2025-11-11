import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
    const session = await getServerSession(authOptions);

    if (session) {
        redirect("/dashboard");
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="text-center max-w-3xl">
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome to Synkora
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                    Collaborative, AI-assisted project management platform with real-time collaboration
                </p>
                <div className="flex gap-4 justify-center">
                    <Link href="/login">
                        <Button size="lg">Sign In</Button>
                    </Link>
                    <Link href="/register">
                        <Button size="lg" variant="outline">Get Started</Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}
