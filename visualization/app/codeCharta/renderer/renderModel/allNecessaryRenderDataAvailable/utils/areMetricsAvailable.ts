import { NodeMetricData } from "../../../../model/codeCharta.model"

type NodeMetricDataName = Pick<NodeMetricData, "name">

const isMetricAvailable = (nodeMetricData: NodeMetricDataName[], metricName: string) => nodeMetricData.some(x => x.name === metricName)

export const areMetricsAvailable = (nodeMetricData: NodeMetricDataName[], metricNames: string[]) =>
    metricNames.every(metric => isMetricAvailable(nodeMetricData, metric))
