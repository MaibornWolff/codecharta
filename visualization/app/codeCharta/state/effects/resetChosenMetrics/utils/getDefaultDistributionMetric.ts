import { NodeMetricData } from "../../../../codeCharta.model"

export const getDefaultDistribution = (nodeMetricData: Pick<NodeMetricData, "key">[]) =>
	nodeMetricData.some(element => element.key === "rloc") ? "rloc" : "unary"
