import { NodeMetricDataAction, setNodeMetricData } from "./nodeMetricData.actions"
import { NodeMetricData } from "../../../../codeCharta.model"

export function splitNodeMetricDataAction(payload: NodeMetricData[]): NodeMetricDataAction {
	return setNodeMetricData(payload)
}
