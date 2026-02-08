'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportProjectButtonProps {
    projectId: string;
    projectName: string;
}

export function ExportProjectButton({ projectId, projectName }: ExportProjectButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        try {
            setIsExporting(true);

            const response = await fetch(`/api/projects/${projectId}/export`);

            if (!response.ok) {
                throw new Error('Failed to export project');
            }

            // Get the blob from response
            const blob = await response.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${projectName.replace(/[^a-z0-9]/gi, '_')}_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error exporting project:', error);
            alert('Failed to export project. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Button
            onClick={handleExport}
            disabled={isExporting}
            variant="outline"
            size="sm"
            className="gap-2"
        >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export Project'}
        </Button>
    );
}
