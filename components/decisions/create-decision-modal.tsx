'use client';

/**
 * Create Decision Record Modal
 * 
 * Modal form for creating new Decision Records with all required fields
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DecisionStatus } from '@/types/decision';
import toast from 'react-hot-toast';

interface CreateDecisionModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    onDecisionCreated?: (decision: any) => void;
    preselectedComponentIds?: string[];
}

export function CreateDecisionModal({
    isOpen,
    onClose,
    projectId,
    onDecisionCreated,
    preselectedComponentIds = [],
}: CreateDecisionModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        context: '',
        decision: '',
        rationale: '',
        consequences: '',
        status: 'PROPOSED' as DecisionStatus,
        tags: '',
        componentIds: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validate required fields
            if (!formData.title.trim()) {
                toast.error('Title is required');
                setIsSubmitting(false);
                return;
            }
            if (!formData.context.trim()) {
                toast.error('Context is required');
                setIsSubmitting(false);
                return;
            }
            if (!formData.decision.trim()) {
                toast.error('Decision is required');
                setIsSubmitting(false);
                return;
            }
            if (!formData.rationale.trim()) {
                toast.error('Rationale is required');
                setIsSubmitting(false);
                return;
            }
            if (!formData.consequences.trim()) {
                toast.error('Consequences is required');
                setIsSubmitting(false);
                return;
            }

            const tags = formData.tags
                .split(',')
                .map((t) => t.trim())
                .filter((t) => t.length > 0);

            const componentIds = formData.componentIds
                .split(',')
                .map((id) => id.trim())
                .filter((id) => id.length > 0);

            const allComponentIds = [...new Set([...preselectedComponentIds, ...componentIds])];

            console.log('Creating decision with data:', {
                title: formData.title,
                context: formData.context,
                decision: formData.decision,
                rationale: formData.rationale,
                consequences: formData.consequences,
                status: formData.status,
                tags,
                linkedComponentIds: allComponentIds,
            });

            const response = await fetch(`/api/projects/${projectId}/decisions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.title,
                    context: formData.context,
                    decision: formData.decision,
                    rationale: formData.rationale,
                    consequences: formData.consequences,
                    status: formData.status,
                    tags,
                    linkedComponentIds: allComponentIds,
                }),
            });

            const responseData = await response.json();
            console.log('Response:', response.status, responseData);

            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to create decision');
            }

            toast.success('Decision Record created successfully');

            if (onDecisionCreated) {
                onDecisionCreated(responseData);
            }

            // Reset form
            setFormData({
                title: '',
                context: '',
                decision: '',
                rationale: '',
                consequences: '',
                status: 'PROPOSED',
                tags: '',
                componentIds: '',
            });

            onClose();
        } catch (error: any) {
            console.error('Error creating decision:', error);
            toast.error(error.message || 'Failed to create decision');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Decision Record</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <Label htmlFor="title">
                            Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Brief title for the decision"
                            required
                        />
                    </div>

                    {/* Context */}
                    <div>
                        <Label htmlFor="context">
                            Context <span className="text-red-500">*</span>
                        </Label>
                        <textarea
                            id="context"
                            value={formData.context}
                            onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                            placeholder="What is the context or problem that led to this decision?"
                            required
                            className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                        />
                    </div>

                    {/* Decision */}
                    <div>
                        <Label htmlFor="decision">
                            Decision <span className="text-red-500">*</span>
                        </Label>
                        <textarea
                            id="decision"
                            value={formData.decision}
                            onChange={(e) => setFormData({ ...formData, decision: e.target.value })}
                            placeholder="What decision was made?"
                            required
                            className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                        />
                    </div>

                    {/* Rationale */}
                    <div>
                        <Label htmlFor="rationale">
                            Rationale <span className="text-red-500">*</span>
                        </Label>
                        <textarea
                            id="rationale"
                            value={formData.rationale}
                            onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
                            placeholder="Why was this decision made? What alternatives were considered?"
                            required
                            className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                        />
                    </div>

                    {/* Consequences */}
                    <div>
                        <Label htmlFor="consequences">
                            Consequences <span className="text-red-500">*</span>
                        </Label>
                        <textarea
                            id="consequences"
                            value={formData.consequences}
                            onChange={(e) => setFormData({ ...formData, consequences: e.target.value })}
                            placeholder="What are the expected outcomes and trade-offs?"
                            required
                            className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <select
                            id="status"
                            value={formData.status}
                            onChange={(e) =>
                                setFormData({ ...formData, status: e.target.value as DecisionStatus })
                            }
                            className="w-full px-3 py-2 border rounded-md"
                        >
                            <option value="PROPOSED">Proposed</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="DEPRECATED">Deprecated</option>
                        </select>
                    </div>

                    {/* Tags */}
                    <div>
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input
                            id="tags"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="architecture, security, performance"
                        />
                    </div>

                    {/* Component IDs */}
                    <div>
                        <Label htmlFor="componentIds">
                            Component IDs (optional, comma-separated)
                            {preselectedComponentIds.length > 0 && (
                                <span className="text-sm text-gray-500 ml-2">
                                    ({preselectedComponentIds.length} preselected)
                                </span>
                            )}
                        </Label>
                        <Input
                            id="componentIds"
                            value={formData.componentIds}
                            onChange={(e) => setFormData({ ...formData, componentIds: e.target.value })}
                            placeholder="Leave empty or enter: USER-SVC-001, PROD-SVC-002"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            You can link components later. Component IDs must match existing components.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Decision'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
