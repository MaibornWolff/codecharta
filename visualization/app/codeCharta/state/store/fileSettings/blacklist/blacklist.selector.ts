import { CcState } from "../../store"

export const blacklistSelector = (state: CcState) => state.fileSettings.blacklist
