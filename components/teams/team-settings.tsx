"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface Team {
    id: string;
    name: string;
    createdAt?: string;
    members?: any[];
    projects?: any[];
}

interface TeamSettingsProps {
    team: Team;
    onTeamUpdated(team: any): void;
    onTeamDeleted(): void;
}

export function TeamSettings({ team, onTeamUpdated, onTeamDeleted }: TeamSettingsProps) {
    const [name, setName] = useState(team.name);
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [error, setError] = useState("");

    const handleUpdateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(`/api/teams/${team.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name }),
            });

            if (response.ok) {
                const updatedTeam = await response.json();
                onTeamUpdated(updatedTeam);
            } else {
                const data = await response.json();
                setError(data.error || "Failed to update team");
            }
        } catch (error) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTeam = async () => {
        if (!confirm(`Are you sure you want to delete "${team.name}"? This action cannot be undone.`)) {
            return;
        }

        setDeleteLoading(true);
        try {
            const response = await fetch(`/api/teams/${team.id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                onTeamDeleted();
            } else {
                const data = await response.json();
                alert(data.error || "Failed to delete team");
            }
        } catch (error) {
            alert("An error occurred. Please try again.");
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Team Settings</h3>
                <form onSubmit={handleUpdateTeam} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="team-name">Team Name</Label>
                        <Input
                            id="team-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            maxLength={100}
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-500">{error}</div>
                    )}

                    <Button type="submit" disabled={loading || name === team.name}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </form>
            </Card>

            <Card className="p-6 border-red-200">
                <h3 className="text-lg font-semibold mb-2 text-red-600">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Once you delete a team, there is no going back. Please be certain.
                </p>
                <Button
                    variant="destructive"
                    onClick={handleDeleteTeam}
                    disabled={deleteLoading}
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleteLoading ? "Deleting..." : "Delete Team"}
                </Button>
            </Card>
        </div>
    );
}
