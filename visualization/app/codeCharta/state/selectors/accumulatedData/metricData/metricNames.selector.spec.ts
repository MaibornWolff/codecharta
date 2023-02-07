import { CcState } from "../../../store/store"
import { metricDataSelector } from "./metricData.selector"
import { metricNamesSelector } from "./metricNames.selector"

const mockedMetricDataSelector = metricDataSelector as unknown as jest.Mock
jest.mock("./metricData.selector", () => ({
	metricDataSelector: jest.fn()
}))

describe("metricNamesSelector", () => {
	it("should get the names of the metrics", () => {
		mockedMetricDataSelector.mockImplementationOnce(() => ({ edgeMetricData: [{ name: "metricOfTruth" }, { name: "otherMetric" }] }))

		expect(metricNamesSelector({} as unknown as CcState)).toEqual(["metricOfTruth", "otherMetric"])
	})
})
