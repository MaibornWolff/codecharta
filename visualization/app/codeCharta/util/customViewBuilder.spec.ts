import { AttributeTypeValue, State } from "../codeCharta.model"
import { buildCustomConfigFromState } from "./customConfigBuilder"

describe("CustomConfigBuilder", () => {
	describe("buildCustomConfigFromState", () => {
		it("should return a new CustomConfig instance", () => {
			// provide some default state properties
			const fromState = {
				appSettings: {
					experimentalFeaturesEnabled: true,
					showMetricLabelNameValue: undefined,
					isWhiteBackground: false,
					camera: { x: 1, y: 2, z: 3 }
				},
				dynamicSettings: {},
				fileSettings: {}
			} as State

			// provide some optional properties
			fromState.fileSettings.attributeTypes = {
				nodes: {
					metric1: AttributeTypeValue.absolute,
					metric2: AttributeTypeValue.relative
				}
			}

			const customConfig = buildCustomConfigFromState("test", fromState)

			expect(customConfig.name).toBe("test")

			expect(typeof customConfig.stateSettings !== "undefined").toBe(true)
			expect(typeof customConfig.stateSettings.dynamicSettings !== "undefined").toBe(true)
			expect(typeof customConfig.stateSettings.appSettings !== "undefined").toBe(true)
			expect(typeof customConfig.stateSettings.fileSettings !== "undefined").toBe(true)

			expect(customConfig.stateSettings.appSettings.experimentalFeaturesEnabled).toBe(true)
			expect(customConfig.stateSettings.appSettings.showMetricLabelNameValue).toBe(undefined)
			expect(customConfig.stateSettings.appSettings.isWhiteBackground).toBe(false)
			expect(customConfig.stateSettings.appSettings.camera.x).toBe(1)
			expect(customConfig.stateSettings.appSettings.camera.y).toBe(2)
			expect(customConfig.stateSettings.appSettings.camera.z).toBe(3)

			// expect optional properties to have been copied
			expect(typeof customConfig.stateSettings.fileSettings.attributeTypes.nodes !== "undefined").toBe(true)
			expect(customConfig.stateSettings.fileSettings.attributeTypes.nodes.metric1).toBe(AttributeTypeValue.absolute)
			expect(customConfig.stateSettings.fileSettings.attributeTypes.nodes.metric2).toBe(AttributeTypeValue.relative)

			expect(typeof customConfig.stateSettings.fileSettings.attributeTypes.edges === "undefined").toBe(true)
		})
	})
})
