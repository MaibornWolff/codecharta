import { CcState } from "../../store/store"
import { metricNamesSelector } from "./metricData/metricNames.selector"

describe("metricNamesSelector", () => {
	it("should get the names of the metrics", () => {
		const state = {
			metricData: {
				edgeMetricData: [{ name: "metricOfTruth" }, { name: "otherMetric" }]
			}
		} as CcState

		expect(metricNamesSelector(state)).toEqual(["metricOfTruth", "otherMetric"])
	})
})
