import { areaMetric } from "./areaMetric.reducer"
import { setAreaMetric } from "./areaMetric.actions"

describe("areaMetric", () => {
    it("should set new areaMetric", () => {
        const result = areaMetric("mcc", setAreaMetric({ value: "another_area_metric" }))

        expect(result).toEqual("another_area_metric")
    })
})
