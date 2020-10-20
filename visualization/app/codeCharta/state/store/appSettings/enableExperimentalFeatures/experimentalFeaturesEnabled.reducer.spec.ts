import { experimentalFeaturesEnabled } from "./experimentalFeaturesEnabled.reducer"
import { ExperimentalFeaturesEnabledAction, setExperimentalFeaturesEnabled } from "./experimentalFeaturesEnabled.actions"

describe("experimentalFeaturesEnabled", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = experimentalFeaturesEnabled(undefined, {} as ExperimentalFeaturesEnabledAction)

			expect(result).toBeFalsy()
		})
	})

	describe("Action: SET_EXPERIMENTAL_FEATURES_ENABLED", () => {
		it("should set new experimentalFeaturesEnabled", () => {
			const result = experimentalFeaturesEnabled(false, setExperimentalFeaturesEnabled(true))

			expect(result).toBeTruthy()
		})

		it("should set default experimentalFeaturesEnabled", () => {
			const result = experimentalFeaturesEnabled(true, setExperimentalFeaturesEnabled())

			expect(result).toBeFalsy()
		})
	})
})
