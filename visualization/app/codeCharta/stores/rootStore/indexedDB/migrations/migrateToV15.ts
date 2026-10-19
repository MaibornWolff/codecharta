// v15: drop fileSettings (edges now derives from the dependency lens, not stored)
export function migrateCcStateRecordToV15<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const next: Record<string, unknown> = { ...(state as Record<string, unknown>) }
    delete next["fileSettings"]
    return next as T
}
