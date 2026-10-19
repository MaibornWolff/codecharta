import { defaultDependencyGraphSettings } from "../../../preferences/preferences.read.facade"

// v30: the dependency graph settings lost the arrangement and the kind mark of declarations and gained the hierarchy
export function migrateCcStateRecordToV30<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const preferences = record["preferences"] as Record<string, unknown> | undefined
    const dependencyGraph = preferences?.["dependencyGraph"]
    if (!dependencyGraph || typeof dependencyGraph !== "object") {
        return state
    }
    const keptSettings = Object.entries(dependencyGraph).filter(([setting]) => setting in defaultDependencyGraphSettings)
    const settingsOfToday = { ...defaultDependencyGraphSettings, ...Object.fromEntries(keptSettings) }
    return { ...record, preferences: { ...preferences, dependencyGraph: settingsOfToday } } as T
}
