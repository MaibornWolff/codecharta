import { heightMetric } from "./heightMetric.reducer"
import { setHeightMetric } from "./heightMetric.actions"

describe("heightMetric", () => {
    it("should set new heightMetric", () => {
        const result = heightMetric("mcc", setHeightMetric({ value: "another_height_metric" }))

        expect(result).toEqual("another_height_metric")
    })
})
