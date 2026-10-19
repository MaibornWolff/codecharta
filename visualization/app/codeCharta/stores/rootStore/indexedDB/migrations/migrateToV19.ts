import { withSeededFileSetting } from "./seedDefaults"

// v19: file states persisted before the domain lens carry no fileSettings.domainWords
export function migrateCcStateRecordToV19<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const files = record["files"]
    if (!Array.isArray(files)) {
        return state
    }
    return { ...record, files: files.map(fileState => withSeededFileSetting(fileState, "domainWords")) } as T
}
