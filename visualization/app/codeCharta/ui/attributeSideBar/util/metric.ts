import { MetricDescriptors } from "./metricDescriptors"
export type Metric = {
	name: string
	value: number
	descriptors: MetricDescriptors
}
