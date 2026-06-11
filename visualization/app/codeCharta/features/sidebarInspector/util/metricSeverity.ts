export type MetricSeverity = "success" | "warning" | "error" | "neutral"

export type MetricBar = {
    fraction: number
    severity: MetricSeverity
}

const LOW_SEVERITY_THRESHOLD = 1 / 3
const MID_SEVERITY_THRESHOLD = 2 / 3

export const calculateMetricBar = (value: number, minValue?: number, maxValue?: number, direction?: number): MetricBar => {
    if (minValue === undefined || maxValue === undefined || maxValue === minValue) {
        return { fraction: 1, severity: "neutral" }
    }
    const fraction = clampFraction((value - minValue) / (maxValue - minValue))
    const isHigherBetter = direction === 1
    return { fraction, severity: toSeverity(isHigherBetter ? 1 - fraction : fraction) }
}

const clampFraction = (fraction: number) => Math.min(1, Math.max(0, fraction))

const toSeverity = (severityInput: number): MetricSeverity => {
    if (severityInput < LOW_SEVERITY_THRESHOLD) {
        return "success"
    }
    if (severityInput < MID_SEVERITY_THRESHOLD) {
        return "warning"
    }
    return "error"
}
