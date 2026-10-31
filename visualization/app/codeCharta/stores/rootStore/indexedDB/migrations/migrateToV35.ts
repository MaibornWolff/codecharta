import { withMissingDependencyGraphSettings } from "./seedDefaults"

// v35: the dependency graph settings gained whether the box under the pointer is highlighted
export function migrateCcStateRecordToV35<T>(state: T): T {
    return state && typeof state === "object" ? withMissingDependencyGraphSettings(state) : state
}
