import { CcState } from "../../store"

export const selectedBuildingIdSelector = (ccState: CcState) => ccState.lookUp.selectedBuildingId
