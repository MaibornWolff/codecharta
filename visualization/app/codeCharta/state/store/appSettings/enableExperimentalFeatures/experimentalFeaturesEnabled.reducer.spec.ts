import { experimentalFeaturesEnabled } from "./experimentalFeaturesEnabled.reducer"
import { setExperimentalFeaturesEnabled } from "./experimentalFeaturesEnabled.actions"

describe("experimentalFeaturesEnabled", () => {
	it("should set new experimentalFeaturesEnabled", () => {
		const result = experimentalFeaturesEnabled(false, setExperimentalFeaturesEnabled({ value: true }))

		expect(result).toBeTruthy()
	})
})
