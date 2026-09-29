import { InjectionToken } from "@angular/core"
import { ExplorerMode, FILES_EXPLORER_MODE } from "./explorerModes"

export interface ExplorerCapabilities {
    showRules: boolean
    showSearch: boolean
    showCounts: boolean
    /** Flattening shapes only the metrics map; a view drawing the files otherwise offers excluding alone. */
    canFlatten: boolean
    // The first mode is the one the explorer opens in; a single mode renders no toggle.
    modes: ExplorerMode[]
}

export const EXPLORER_CAPABILITIES = new InjectionToken<ExplorerCapabilities>("EXPLORER_CAPABILITIES")

export const DEFAULT_EXPLORER_CAPABILITIES: ExplorerCapabilities = {
    showRules: true,
    showSearch: true,
    showCounts: true,
    canFlatten: true,
    modes: [FILES_EXPLORER_MODE]
}
