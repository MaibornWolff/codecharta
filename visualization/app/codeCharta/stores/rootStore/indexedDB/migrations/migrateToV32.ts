import { withMissingDependencyGraphSettings } from "./seedDefaults"

// v32: the dependency graph settings gained whether the hover is held to the shown edge types
export function migrateCcStateRecordToV32<T>(state: T): T {
    return state && typeof state === "object" ? withMissingDependencyGraphSettings(state) : state
}
