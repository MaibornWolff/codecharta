import { CcState } from "../../store"

export const hoveredBuildingPathSelector = (ccState: CcState) => ccState.appStatus.hoveredBuildingPath
