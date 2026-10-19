// v10: isLoadingFile → top-level (was appSettings); currentFilesAreSampleFiles → top-level; drop appStatus
export function migrateCcStateRecordToV10<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const next: Record<string, unknown> = { ...record }

    const appSettings = record["appSettings"]
    if (appSettings && typeof appSettings === "object") {
        const trimmed = { ...(appSettings as Record<string, unknown>) }
        if ("isLoadingFile" in trimmed) {
            next["isLoadingFile"] = trimmed["isLoadingFile"]
            delete trimmed["isLoadingFile"]
        }
        next["appSettings"] = trimmed
    }

    const appStatus = record["appStatus"]
    if (appStatus && typeof appStatus === "object" && "currentFilesAreSampleFiles" in (appStatus as Record<string, unknown>)) {
        next["currentFilesAreSampleFiles"] = (appStatus as Record<string, unknown>)["currentFilesAreSampleFiles"]
    }
    delete next["appStatus"]

    return next as T
}
