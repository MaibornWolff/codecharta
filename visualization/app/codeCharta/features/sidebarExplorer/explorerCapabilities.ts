import { InjectionToken } from "@angular/core"
import { SortingOption } from "../../model/codeCharta.model"

export interface ExplorerCapabilities {
    showRules: boolean
    showSearch: boolean
    showFind: boolean
    showCounts: boolean
    sortOptions: SortingOption[]
}

export const EXPLORER_CAPABILITIES = new InjectionToken<ExplorerCapabilities>("EXPLORER_CAPABILITIES")

export const DEFAULT_EXPLORER_CAPABILITIES: ExplorerCapabilities = {
    showRules: true,
    showSearch: true,
    showFind: false,
    showCounts: true,
    sortOptions: Object.values(SortingOption)
}
