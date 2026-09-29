import { ExplorerSortConfig } from "../../../features/sidebarExplorer/facade"
import { SortingOption } from "../../../model/codeCharta.model"
import { sortingOrderAscendingSelector, sortingOrderSelector } from "../../../stores/preferences/preferences.read.facade"
import { setSortingOption, toggleSortingOrderAscending } from "../../../stores/preferences/preferences.write.facade"

// The metrics view's sort order, shared like its search.
export const DEPENDENCY_EXPLORER_SORT: ExplorerSortConfig = {
    options: Object.values(SortingOption),
    optionSelector: sortingOrderSelector,
    ascendingSelector: sortingOrderAscendingSelector,
    setOption: setSortingOption,
    toggleAscending: () => toggleSortingOrderAscending()
}
