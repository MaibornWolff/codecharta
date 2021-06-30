import { CcState } from "../../store"

export const sortingOrderAscendingSelector = (state: CcState): boolean => state.appSettings.sortingOrderAscending
