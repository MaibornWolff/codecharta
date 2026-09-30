export type PersistedRecord = Record<string, unknown>

export type KeyMoves = Record<string, readonly string[]>

type PersistedFileState = { file?: { settings?: { fileSettings?: PersistedRecord } } }

export function isPersistedRecord(value: unknown): value is PersistedRecord {
    return !!value && typeof value === "object"
}

export function moveKeysIntoRoot<T>(state: T, moves: KeyMoves, targetRoot: string, targetDefaults: object): T {
    if (!isPersistedRecord(state)) {
        return state
    }
    const target: PersistedRecord = { ...targetDefaults, ...(state[targetRoot] as PersistedRecord) }
    const next: PersistedRecord = { ...state }
    for (const [home, keys] of Object.entries(moves)) {
        const source = state[home]
        if (isPersistedRecord(source)) {
            next[home] = withKeysMovedInto(source, keys, target)
        }
    }
    next[targetRoot] = target
    return next as T
}

function withKeysMovedInto(source: PersistedRecord, keys: readonly string[], target: PersistedRecord): PersistedRecord {
    const trimmed = { ...source }
    for (const key of keys) {
        if (key in trimmed) {
            target[key] = trimmed[key]
            delete trimmed[key]
        }
    }
    return trimmed
}

export function withoutKeys<T>(value: T, keys: readonly string[]): T {
    if (!isPersistedRecord(value)) {
        return value
    }
    const trimmed: PersistedRecord = { ...value }
    for (const key of keys) {
        delete trimmed[key]
    }
    return trimmed as T
}

export function seedRootIfAbsent<T>(state: T, rootKey: string, defaultValue: unknown): T {
    if (!isPersistedRecord(state) || state[rootKey]) {
        return state
    }
    return { ...state, [rootKey]: defaultValue } as T
}

export function seedIntoRootIfAbsent<T>(state: T, rootKey: string, markerKey: string, seed: PersistedRecord): T {
    if (!isPersistedRecord(state)) {
        return state
    }
    const root = state[rootKey]
    if (!isPersistedRecord(root) || markerKey in root) {
        return state
    }
    return { ...state, [rootKey]: { ...seed, ...root } } as T
}

export function withSeededFileSetting(fileState: unknown, key: string): unknown {
    const fileSettings = (fileState as PersistedFileState)?.file?.settings?.fileSettings
    if (!isPersistedRecord(fileSettings) || fileSettings[key]) {
        return fileState
    }
    const state = fileState as PersistedRecord
    const file = state["file"] as PersistedRecord
    const settings = file["settings"] as PersistedRecord
    return {
        ...state,
        file: { ...file, settings: { ...settings, fileSettings: { ...fileSettings, [key]: {} } } }
    }
}
