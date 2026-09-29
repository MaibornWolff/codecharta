import { InjectionToken } from "@angular/core"
import { ViewId } from "../../routing/routePaths"

export type ExplorerStorageScope = ViewId

export const EXPLORER_STORAGE_SCOPE = new InjectionToken<ExplorerStorageScope>("EXPLORER_STORAGE_SCOPE")

export const scopedStorageKey = (key: string, scope: ExplorerStorageScope) => `${key}.${scope}`
