import { SortingOption } from "../../model/codeCharta.model"
import { sortingOrderAscendingSelector, sortingOrderSelector } from "../../stores/preferences/preferences.read.facade"
import { setSortingOption, toggleSortingOrderAscending } from "../../stores/preferences/preferences.write.facade"
import { ExplorerSortConfig } from "../sidebarExplorer/facade"

export const MAP_EXPLORER_SORT: ExplorerSortConfig = {
    options: Object.values(SortingOption),
    optionSelector: sortingOrderSelector,
    ascendingSelector: sortingOrderAscendingSelector,
    setOption: setSortingOption,
    toggleAscending: () => toggleSortingOrderAscending()
}
