import { CcState } from "../../../store/store"
import { edgeMetricDataSelector } from "./edgeMetricData.selector"
import { metricNamesSelector } from "./metricNames.selector"

const mockedEdgeMetricDataSelector = edgeMetricDataSelector as unknown as jest.Mock
jest.mock("./edgeMetricData.selector", () => ({
	edgeMetricDataSelector: jest.fn()
}))

describe("metricNamesSelector", () => {
	it("should get the names of the metrics", () => {
		mockedEdgeMetricDataSelector.mockImplementationOnce(() => [{ name: "metricOfTruth" }, { name: "otherMetric" }])

		expect(metricNamesSelector({} as unknown as CcState)).toEqual(["metricOfTruth", "otherMetric"])
	})
})
