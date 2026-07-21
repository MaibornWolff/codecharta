import { InjectionToken } from "@angular/core"
import { SortingOption } from "../../model/codeCharta.model"

/**
 * Which optional chrome the hosting view wants. The tree, header and sort control are always on; the three
 * booleans gate the flatten/exclude rules, the search bar and the area-based counters — all 3D-map concepts
 * the domain word cloud has no use for. `sortOptions` scopes WHICH orderings the sort menu offers, because
 * some (e.g. Area Size) are map-only and mean nothing in a view with no area metric. A slim value token:
 * each view provides its own literal.
 */
export interface ExplorerCapabilities {
    showRules: boolean
    showSearch: boolean
    showCounts: boolean
    sortOptions: SortingOption[]
}

export const EXPLORER_CAPABILITIES = new InjectionToken<ExplorerCapabilities>("EXPLORER_CAPABILITIES")
