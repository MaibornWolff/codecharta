import { withMissingDependencyGraphSettings } from "./seedDefaults"

// v29: dependency graph settings persisted before the graph showed declarations carry none of the settings for them
export function migrateCcStateRecordToV29<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    return withMissingDependencyGraphSettings(state)
}
