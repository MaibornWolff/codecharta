import { MetricDescriptors } from "./metricDescriptors"
export type Edge = {
	name: string
	incoming: number | undefined
	outgoing: number | undefined
	descriptors: MetricDescriptors
}
