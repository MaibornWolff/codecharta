import { CcState } from "../../store"

export const sortingOrderSelector = (state: CcState) => state.dynamicSettings.sortingOption
