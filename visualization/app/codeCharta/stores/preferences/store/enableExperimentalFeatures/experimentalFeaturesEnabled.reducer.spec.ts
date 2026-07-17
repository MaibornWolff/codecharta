import { setExperimentalFeaturesEnabled } from "./experimentalFeaturesEnabled.actions"
import { experimentalFeaturesEnabled } from "./experimentalFeaturesEnabled.reducer"

describe("experimentalFeaturesEnabled", () => {
    it("should set new experimentalFeaturesEnabled", () => {
        const result = experimentalFeaturesEnabled(false, setExperimentalFeaturesEnabled({ value: true }))

        expect(result).toBeTruthy()
    })
})
