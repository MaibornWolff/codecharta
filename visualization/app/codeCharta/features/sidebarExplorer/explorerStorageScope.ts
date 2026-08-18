import { InjectionToken } from "@angular/core"

export type ExplorerStorageScope = "metrics" | "domain"

export const EXPLORER_STORAGE_SCOPE = new InjectionToken<ExplorerStorageScope>("EXPLORER_STORAGE_SCOPE")

export const scopedStorageKey = (key: string, scope: ExplorerStorageScope) => `${key}.${scope}`
