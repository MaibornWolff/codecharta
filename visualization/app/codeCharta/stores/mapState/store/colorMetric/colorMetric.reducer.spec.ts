import { setColorMetric } from "./colorMetric.actions"
import { colorMetric } from "./colorMetric.reducer"

describe("colorMetric", () => {
    it("should set new colorMetric", () => {
        const result = colorMetric("mcc", setColorMetric({ value: "another_color_metric" }))

        expect(result).toEqual("another_color_metric")
    })
})
