import { CcState } from "../../store"

export const hoveredBuildingPathSelector = (ccState: CcState) => ccState.lookUp.hoveredBuildingPath
