import { CcState } from "../../store"

export const invertAreaSelector = (state: CcState): boolean => state.appSettings.invertArea
