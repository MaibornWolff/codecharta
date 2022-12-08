import { NodeMetricData } from "../../../../codeCharta.model"

type NodeMetricDataKey = Pick<NodeMetricData, "key">

const isMetricAvailable = (nodeMetricData: NodeMetricDataKey[], metricName: string) => nodeMetricData.some(x => x.key === metricName)

export const areMetricsAvailable = (nodeMetricData: NodeMetricDataKey[], metricKeys: string[]) =>
	metricKeys.every(metric => isMetricAvailable(nodeMetricData, metric))
