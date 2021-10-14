import { CcState } from "../../store"

export const selectedBuildingIdSelector = (state: CcState) => state.appStatus.selectedBuildingId
