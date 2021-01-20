import { setTrackingDataEnabled, TrackingDataEnabledAction } from "./trackingDataEnabled.actions"
import { trackingDataEnabled } from "./trackingDataEnabled.reducer"

describe("trackingDataEnabled", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = trackingDataEnabled(undefined, {} as TrackingDataEnabledAction)

			expect(result).toBeFalsy()
		})
	})

	describe("Action: SET_EXPERIMENTAL_FEATURES_ENABLED", () => {
		it("should set new trackingDataEnabled", () => {
			const result = trackingDataEnabled(false, setTrackingDataEnabled(true))

			expect(result).toBeTruthy()
		})

		it("should set default trackingDataEnabled", () => {
			const result = trackingDataEnabled(true, setTrackingDataEnabled())

			expect(result).toBeFalsy()
		})
	})
})
