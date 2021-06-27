import { CcState } from "../../store"

export const selectSortingOrderAscending = (state: CcState): boolean => state.appSettings.sortingOrderAscending
