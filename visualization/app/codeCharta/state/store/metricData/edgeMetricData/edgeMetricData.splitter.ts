import { setEdgeMetricData } from "./edgeMetricData.actions"
import { EdgeMetricData } from "../../../../codeCharta.model"

export function splitEdgeMetricDataAction(payload: EdgeMetricData[]) {
	return setEdgeMetricData(payload)
}
