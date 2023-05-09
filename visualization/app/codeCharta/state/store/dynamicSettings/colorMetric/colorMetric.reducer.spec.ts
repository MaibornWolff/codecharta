import { colorMetric } from "./colorMetric.reducer"
import { setColorMetric } from "./colorMetric.actions"

describe("colorMetric", () => {
	it("should set new colorMetric", () => {
		const result = colorMetric("mcc", setColorMetric({ value: "another_color_metric" }))

		expect(result).toEqual("another_color_metric")
	})
})
