import { SecondaryMetricsAction, setSecondaryMetrics } from "./secondaryMetrics.actions"
import { SecondaryMetric } from "../../../../ui/attributeSideBar/attributeSideBar.component"

export function splitSecondaryMetricsAction(payload: SecondaryMetric[]): SecondaryMetricsAction {
	return setSecondaryMetrics(payload)
}
