import { Vector3 } from "three"
import { buildCustomConfigFromState } from "./customConfigBuilder"
import { DEFAULT_STATE } from "./dataMocks"
import { AppSettings, State } from "../codeCharta.model"

describe("CustomConfigBuilder", () => {
	describe("buildCustomConfigFromState", () => {
		it("should return a new CustomConfig instance", () => {
			const state: State = { ...DEFAULT_STATE, appSettings: { experimentalFeaturesEnabled: true } as AppSettings }

			const customConfig = buildCustomConfigFromState("testCustomConfig", state, {
				camera: new Vector3(1, 2, 3),
				cameraTarget: new Vector3(4, 5, 6)
			})

			expect(customConfig.name).toBe("testCustomConfig")

			expect(customConfig.stateSettings).not.toBeUndefined()
			expect(customConfig.stateSettings.dynamicSettings).not.toBeUndefined()
			expect(customConfig.stateSettings.appSettings).not.toBeUndefined()
			expect(customConfig.stateSettings.fileSettings).not.toBeUndefined()

			expect(customConfig.stateSettings.appSettings.experimentalFeaturesEnabled).toBe(true)
			expect(customConfig.stateSettings.fileSettings).not.toContain({ attributeTypes: { nodes: {}, edges: {} } })

			expect(customConfig.camera.camera.x).toBe(1)
			expect(customConfig.camera.camera.y).toBe(2)
			expect(customConfig.camera.camera.z).toBe(3)
			expect(customConfig.camera.cameraTarget.x).toBe(4)
			expect(customConfig.camera.cameraTarget.y).toBe(5)
			expect(customConfig.camera.cameraTarget.z).toBe(6)
		})
	})
})
