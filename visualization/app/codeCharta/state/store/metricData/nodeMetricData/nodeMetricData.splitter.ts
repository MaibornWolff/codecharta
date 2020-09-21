import { setNodeMetricData } from "./nodeMetricData.actions"
import { NodeMetricData } from "../../../../codeCharta.model"

export function splitNodeMetricDataAction(payload: NodeMetricData[]) {
	return setNodeMetricData(payload)
}
