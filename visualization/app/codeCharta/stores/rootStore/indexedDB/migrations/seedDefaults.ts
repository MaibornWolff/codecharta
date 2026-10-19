import { defaultDependencyGraphSettings } from "../../../preferences/preferences.read.facade"

export function seedRootIfAbsent<T>(state: T, key: string, defaultValue: unknown): T {
    if (!state || typeof state !== "object") {
        return state
    }
    const record = state as Record<string, unknown>
    if (record[key]) {
        return state
    }
    return { ...record, [key]: defaultValue } as T
}

type PersistedFileState = { file?: { settings?: { fileSettings?: Record<string, unknown> } } }

export function withSeededFileSetting(fileState: unknown, key: string): unknown {
    const fileSettings = (fileState as PersistedFileState)?.file?.settings?.fileSettings
    if (!fileSettings || typeof fileSettings !== "object" || fileSettings[key]) {
        return fileState
    }
    const state = fileState as Record<string, unknown>
    const file = state["file"] as Record<string, unknown>
    const settings = file["settings"] as Record<string, unknown>
    return {
        ...state,
        file: { ...file, settings: { ...settings, fileSettings: { ...fileSettings, [key]: {} } } }
    }
}

export function withMissingDependencyGraphSettings<T>(state: T): T {
    const record = state as Record<string, unknown>
    const preferences = record["preferences"] as Record<string, unknown> | undefined
    const dependencyGraph = preferences?.["dependencyGraph"]
    if (!dependencyGraph || typeof dependencyGraph !== "object") {
        return state
    }
    const hasEverySetting = Object.keys(defaultDependencyGraphSettings).every(setting => setting in dependencyGraph)
    if (hasEverySetting) {
        return state
    }
    return { ...record, preferences: { ...preferences, dependencyGraph: { ...defaultDependencyGraphSettings, ...dependencyGraph } } } as T
}
