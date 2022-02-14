import { CcState } from "../../store"

export const toggleEdgeMetricSelector = (state: CcState): boolean => state.appSettings.edgeMetricToggler
