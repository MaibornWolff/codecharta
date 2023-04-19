import { MetricDescriptors } from "../../../util/metric/metricDescriptors"
export type Metric = {
	name: string
	value: number
	descriptors: MetricDescriptors
}
