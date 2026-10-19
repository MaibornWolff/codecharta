const BOX_BADGES_OF_V33 = ["betweenFiles", "insideFiles", "declaration", "upward"]
const BOX_BADGES_OF_V33_WITHOUT_CYCLES = ["upward"]

// v33: the dependency graph lost its level labels by path, and each box badge is switched on its own instead of the cycle badges together
export function migrateCcStateRecordToV33<T>(state: T): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    const preferences = record["preferences"] as Record<string, unknown> | undefined
    const dependencyGraph = preferences?.["dependencyGraph"] as Record<string, unknown> | undefined
    // v32 seeds the badges of today's defaults, so the settings that were replaced decide, not the badges.
    const isReplaced = (setting: string) => setting in dependencyGraph
    if (!dependencyGraph || typeof dependencyGraph !== "object" || !["levelLabel", "showsCycleBadges"].some(isReplaced)) {
        return state
    }
    const { levelLabel, showsCycleBadges, ...keptSettings } = dependencyGraph
    const shownBoxBadges = showsCycleBadges === false ? BOX_BADGES_OF_V33_WITHOUT_CYCLES : BOX_BADGES_OF_V33
    return { ...record, preferences: { ...preferences, dependencyGraph: { ...keptSettings, shownBoxBadges: [...shownBoxBadges] } } } as T
}
