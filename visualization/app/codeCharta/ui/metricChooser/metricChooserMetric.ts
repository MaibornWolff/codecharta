import { EdgeMetricData, NodeMetricData } from "../../codeCharta.model"

export type MetricChooserMetric = (NodeMetricData | EdgeMetricData) & {
	title: string
	description: string
	hintLowValue: string
	hintMaxValue: string
}
