import { CcState } from "../../store"

export const searchPatternSelector = (state: CcState) => state.dynamicSettings.searchPattern
