import { State } from "../codeCharta.model"
import { trackMapMetaData } from "./usageDataTracker"
import * as EnvironmentDetector from "./envDetector"

describe("UsageDataTracker", () => {
	describe("trackMetaUsageData", () => {
		it("should not track in web version", () => {
			// provide some default state properties
			const stateStub = {
				appSettings: {
					experimentalFeaturesEnabled: true,
					showMetricLabelNameValue: undefined,
					isWhiteBackground: false,
					camera: { x: 1, y: 2, z: 3 }
				},
				dynamicSettings: {},
				fileSettings: {}
			} as State

			jest.spyOn(EnvironmentDetector, "isStandalone").mockReturnValue(false)
			//jest.spyOn(EnvironmentDetector, "isSingleState").mockReturnValue(false)
			//jest.spyOn(EnvironmentDetector, "getVisibleFileStates").mockReturnValue(false)
			trackMapMetaData(stateStub)
		})
	})
})
