import { CcState } from "../../../store/store"
import { edgeMetricDataSelector } from "./edgeMetricData.selector"
import { metricKeysSelector } from "./metricKeysSelector"

const mockedEdgeMetricDataSelector = edgeMetricDataSelector as unknown as jest.Mock
jest.mock("./edgeMetricData.selector", () => ({
	edgeMetricDataSelector: jest.fn()
}))

describe("metricNamesSelector", () => {
	it("should get the keys of the metrics", () => {
		mockedEdgeMetricDataSelector.mockImplementationOnce(() => [{ key: "metricOfTruth" }, { key: "otherMetric" }])

		expect(metricKeysSelector({} as unknown as CcState)).toEqual(["metricOfTruth", "otherMetric"])
	})
})
