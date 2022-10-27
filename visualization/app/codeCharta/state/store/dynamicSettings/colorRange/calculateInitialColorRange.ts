import { MetricMinMax } from "../../../selectors/accumulatedData/metricData/selectedColorMetricData.selector"

export const calculateInitialColorRange = (metricMinMax: MetricMinMax) => {
	const totalRange = metricMinMax.maxValue - metricMinMax.minValue
	const aThird = Math.round(totalRange / 3)
	const firstThird = aThird + metricMinMax.minValue
	const secondThird = aThird * 2 + metricMinMax.minValue
	return { from: firstThird, to: secondThird }
}
