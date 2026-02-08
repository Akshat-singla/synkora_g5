/**
 * Risk Analysis Service
 * 
 * Calculates risk factors for components including:
 * - Architectural churn (commit frequency)
 * - Decision coverage (decisions per component)
 * - Coupling (dependencies to/from component)
 */

import { prisma } from './prisma';

export interface RiskFactor {
    type: 'high_churn' | 'low_decision_coverage' | 'high_coupling';
    description: string;
    metric: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ComponentRiskMetrics {
    componentId: string;
    componentName?: string;
    churnRate: number;
    decisionCount: number;
    couplingScore: number;
    riskFactors: RiskFactor[];
    overallSeverity: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number; // 0-100
}

// Thresholds for risk calculation
const THRESHOLDS = {
    churn: {
        low: 5,      // commits per 30 days
        medium: 10,
        high: 20,
    },
    decisions: {
        low: 0,      // decisions per component
        medium: 1,
        high: 3,
    },
    coupling: {
        low: 3,      // number of dependencies
        medium: 6,
        high: 10,
    },
};

/**
 * Calculate architectural churn for a component
 * Returns the number of commits affecting this component in the last 30 days
 */
async function calculateChurn(componentId: string): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Count commits linked to this component in the last 30 days
    const commitCount = await prisma.componentCommit.count({
        where: {
            componentId,
            commit: {
                committedAt: {
                    gte: thirtyDaysAgo,
                },
            },
        },
    });

    return commitCount;
}

/**
 * Calculate decision coverage for a component
 * Returns the number of decisions linked to this component
 */
async function calculateDecisionCoverage(componentId: string): Promise<number> {
    const count = await prisma.componentDecision.count({
        where: { componentId },
    });

    return count;
}

/**
 * Calculate coupling score for a component
 * Counts the number of relationships (dependencies, data flows) to/from this component
 * Uses canvas state to detect connections between components
 */
async function calculateCoupling(componentId: string): Promise<number> {
    // Get the component to find its canvas
    const component = await prisma.component.findUnique({
        where: { id: componentId },
        select: {
            canvasId: true,
            componentId: true,
        },
    });

    if (!component) {
        return 0;
    }

    // Get the canvas state which contains tldraw shapes and connections
    const canvas = await prisma.canvas.findUnique({
        where: { id: component.canvasId },
        select: {
            state: true,
        },
    });

    if (!canvas || !canvas.state) {
        return 0;
    }

    // Parse canvas state to count arrows/connections to/from this component
    // tldraw stores shapes in the state object
    const state = canvas.state as any;
    let connectionCount = 0;

    // Check if state has the expected structure
    if (state && typeof state === 'object') {
        // tldraw stores records in state.store or directly in state
        const records = state.store || state;

        if (records && typeof records === 'object') {
            // Iterate through all shapes to find arrows
            Object.values(records).forEach((shape: any) => {
                if (shape && typeof shape === 'object') {
                    // Check if it's an arrow shape
                    if (shape.type === 'arrow' || shape.typeName === 'shape' && shape.type === 'arrow') {
                        // Arrows have start and end bindings
                        const startBinding = shape.props?.start?.boundShapeId;
                        const endBinding = shape.props?.end?.boundShapeId;

                        // Count if this arrow connects to our component
                        // (We'd need to match shape IDs to component IDs, which is complex)
                        // For now, we'll use a simpler heuristic
                    }
                }
            });
        }
    }

    // Alternative approach: Count based on component relationships in decisions
    // Components that are mentioned together in decisions are likely coupled
    const relatedComponents = await prisma.componentDecision.findMany({
        where: {
            componentId,
        },
        select: {
            decision: {
                select: {
                    componentDecisions: {
                        where: {
                            componentId: {
                                not: componentId,
                            },
                        },
                        select: {
                            componentId: true,
                        },
                    },
                },
            },
        },
    });

    // Count unique components that share decisions with this component
    const relatedComponentIds = new Set<string>();
    relatedComponents.forEach(cd => {
        cd.decision.componentDecisions.forEach(otherCd => {
            relatedComponentIds.add(otherCd.componentId);
        });
    });

    // Use the count of related components as a coupling metric
    connectionCount = relatedComponentIds.size;

    return connectionCount;
}

/**
 * Determine severity level based on metric value and thresholds
 */
function determineSeverity(
    metric: number,
    thresholds: { low: number; medium: number; high: number },
    inverse: boolean = false
): 'low' | 'medium' | 'high' | 'critical' {
    if (inverse) {
        // For metrics where lower is worse (e.g., decision coverage)
        if (metric <= thresholds.low) return 'critical';
        if (metric <= thresholds.medium) return 'high';
        if (metric <= thresholds.high) return 'medium';
        return 'low';
    } else {
        // For metrics where higher is worse (e.g., churn, coupling)
        if (metric >= thresholds.high) return 'critical';
        if (metric >= thresholds.medium) return 'high';
        if (metric >= thresholds.low) return 'medium';
        return 'low';
    }
}

/**
 * Calculate risk score (0-100) based on all factors
 */
function calculateRiskScore(
    churnRate: number,
    decisionCount: number,
    couplingScore: number
): number {
    // Weighted risk calculation
    const churnWeight = 0.4;
    const decisionWeight = 0.4;
    const couplingWeight = 0.2;

    // Normalize each metric to 0-100 scale
    const churnScore = Math.min((churnRate / THRESHOLDS.churn.high) * 100, 100);
    const decisionScore = decisionCount === 0 ? 100 : Math.max(0, 100 - (decisionCount / THRESHOLDS.decisions.high) * 100);
    const couplingNormalized = Math.min((couplingScore / THRESHOLDS.coupling.high) * 100, 100);

    const totalScore = (
        churnScore * churnWeight +
        decisionScore * decisionWeight +
        couplingNormalized * couplingWeight
    );

    return Math.round(totalScore);
}

/**
 * Calculate comprehensive risk metrics for a component
 */
export async function calculateComponentRisk(componentId: string): Promise<ComponentRiskMetrics> {
    // Fetch component details
    const component = await prisma.component.findUnique({
        where: { id: componentId },
        select: {
            id: true,
            componentId: true,
            name: true,
        },
    });

    if (!component) {
        throw new Error(`Component ${componentId} not found`);
    }

    const [churnRate, decisionCount, couplingScore] = await Promise.all([
        calculateChurn(componentId),
        calculateDecisionCoverage(componentId),
        calculateCoupling(componentId),
    ]);

    const riskFactors: RiskFactor[] = [];

    // Check for high churn
    const churnSeverity = determineSeverity(churnRate, THRESHOLDS.churn);
    if (churnSeverity !== 'low') {
        riskFactors.push({
            type: 'high_churn',
            description: `High change frequency: ${churnRate} commits in last 30 days`,
            metric: churnRate,
            severity: churnSeverity,
        });
    }

    // Check for low decision coverage
    const decisionSeverity = determineSeverity(decisionCount, THRESHOLDS.decisions, true);
    if (decisionSeverity !== 'low') {
        riskFactors.push({
            type: 'low_decision_coverage',
            description: `Low decision documentation: ${decisionCount} decision${decisionCount === 1 ? '' : 's'}`,
            metric: decisionCount,
            severity: decisionSeverity,
        });
    }

    // Check for high coupling
    const couplingSeverity = determineSeverity(couplingScore, THRESHOLDS.coupling);
    if (couplingSeverity !== 'low') {
        riskFactors.push({
            type: 'high_coupling',
            description: `High coupling: ${couplingScore} dependencies`,
            metric: couplingScore,
            severity: couplingSeverity,
        });
    }

    // Calculate overall severity (highest severity among all factors)
    const severityLevels = ['low', 'medium', 'high', 'critical'];
    const maxSeverityIndex = Math.max(
        ...riskFactors.map(rf => severityLevels.indexOf(rf.severity)),
        0
    );
    const overallSeverity = severityLevels[maxSeverityIndex] as 'low' | 'medium' | 'high' | 'critical';

    const riskScore = calculateRiskScore(churnRate, decisionCount, couplingScore);

    return {
        componentId: component.componentId,
        componentName: component.name,
        churnRate,
        decisionCount,
        couplingScore,
        riskFactors,
        overallSeverity,
        riskScore,
    };
}

/**
 * Calculate risk metrics for all components in a project
 */
export async function calculateProjectRisks(projectId: string): Promise<ComponentRiskMetrics[]> {
    // Get all components for the project
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            canvas: {
                include: {
                    components: {
                        select: {
                            id: true,
                            componentId: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });

    if (!project?.canvas) {
        return [];
    }

    const components = project.canvas.components;

    // Calculate risk for each component
    const riskMetrics = await Promise.all(
        components.map(component => calculateComponentRisk(component.id))
    );

    return riskMetrics;
}

/**
 * Get high-risk components for a project
 */
export async function getHighRiskComponents(
    projectId: string,
    minSeverity: 'medium' | 'high' | 'critical' = 'medium'
): Promise<ComponentRiskMetrics[]> {
    const allRisks = await calculateProjectRisks(projectId);

    const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
    const minLevel = severityOrder[minSeverity];

    return allRisks.filter(risk => severityOrder[risk.overallSeverity] >= minLevel);
}
