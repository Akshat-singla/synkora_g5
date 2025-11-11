import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
    title: "Synkora - Collaborative Project Management",
    description: "AI-assisted project management platform with real-time collaboration",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="antialiased">
                <ThemeProvider defaultTheme="dark" storageKey="synkora-theme">
                    <SessionProvider>
                        {children}
                    </SessionProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
