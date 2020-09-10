import { EdgeMetricDataAction, setEdgeMetricData } from "./edgeMetricData.actions"
import { EdgeMetricData } from "../../../../codeCharta.model"

export function splitEdgeMetricDataAction(payload: EdgeMetricData[]): EdgeMetricDataAction {
	return setEdgeMetricData(payload)
}
