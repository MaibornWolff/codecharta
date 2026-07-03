import { createSelector } from "@ngrx/store"
import { preferencesSelector } from "../preferences.selector"

// The public names are kept stable across the Slice 10c merge so the sidebarExplorer feature and the
// render-availability gate keep reading through the same facade selectors: sortingOrderSelector still
// yields the sort OPTION (now preferences.sorting.option) — the historically confusing name predates
// the merge — and sortingOrderAscendingSelector still yields the sort order boolean.
export const sortingOrderSelector = createSelector(preferencesSelector, preferences => preferences.sorting.option)
export const sortingOrderAscendingSelector = createSelector(preferencesSelector, preferences => preferences.sorting.orderAscending)
