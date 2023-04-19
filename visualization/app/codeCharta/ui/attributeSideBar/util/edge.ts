import { MetricDescriptors } from "../../../util/metric/metricDescriptors"
export type Edge = {
	name: string
	incoming: number | undefined
	outgoing: number | undefined
	descriptors: MetricDescriptors
}
