import { InjectionToken } from "@angular/core"
import { SortingOption } from "../../model/codeCharta.model"

/**
 * Which optional chrome the hosting view wants. The tree, header and sort control are always on; the
 * booleans gate the flatten/exclude rules, the map-filtering search bar, the area-based counters — all
 * 3D-map concepts the domain word cloud has no use for — and, conversely, `showFind`, a tree find/highlight
 * the domain view wants because its explorer is the ONLY way to scope the cloud (the map's search filters
 * the map, which is meaningless there). A view enables at most one of `showSearch`/`showFind`. `sortOptions`
 * scopes WHICH orderings the sort menu offers, because some (e.g. Area Size) are map-only and mean nothing
 * in a view with no area metric. A slim value token: each view provides its own literal.
 */
export interface ExplorerCapabilities {
    showRules: boolean
    showSearch: boolean
    showFind: boolean
    showCounts: boolean
    sortOptions: SortingOption[]
}

export const EXPLORER_CAPABILITIES = new InjectionToken<ExplorerCapabilities>("EXPLORER_CAPABILITIES")

/** All map chrome on with every ordering offered — the full-featured default the metrics map view wants. */
export const DEFAULT_EXPLORER_CAPABILITIES: ExplorerCapabilities = {
    showRules: true,
    showSearch: true,
    showFind: false,
    showCounts: true,
    sortOptions: Object.values(SortingOption)
}
