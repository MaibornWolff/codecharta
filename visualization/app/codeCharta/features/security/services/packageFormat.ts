import { Severity } from "../../../model/codeCharta.model"

const BADGE_BY_SEVERITY: Record<Severity, string> = {
    critical: "badge-error",
    high: "badge-warning",
    medium: "badge-info",
    low: "badge-ghost",
    unknown: "badge-ghost"
}

export function severityBadgeClass(severity: Severity): string {
    return BADGE_BY_SEVERITY[severity]
}

export function formatOptional(value: number | undefined | null, unit = ""): string {
    return value === undefined || value === null ? "—" : `${value}${unit}`
}

/** A path as the reader knows it, without the map's root folder. */
export function shownPath(path: string): string {
    return path.replace(/^\/root\//, "")
}
