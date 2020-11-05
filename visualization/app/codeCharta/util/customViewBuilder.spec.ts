import {AttributeTypeValue, State} from "../codeCharta.model"
import {buildCustomViewFromState} from "./customViewBuilder";

describe("CustomViewBuilder", () => {
	describe("buildCustomViewFromState", () => {
		it("should return a new CustomView instance", () => {
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

			const customView = buildCustomViewFromState("test", fromState)

			expect(customView.name).toBe("test")

			expect(typeof customView.stateSettings !== "undefined").toBe(true)
			expect(typeof customView.stateSettings.dynamicSettings !== "undefined").toBe(true)
			expect(typeof customView.stateSettings.appSettings !== "undefined").toBe(true)
			expect(typeof customView.stateSettings.fileSettings !== "undefined").toBe(true)

			expect(customView.stateSettings.appSettings.experimentalFeaturesEnabled).toBe(true)
			expect(customView.stateSettings.appSettings.showMetricLabelNameValue).toBe(undefined)
			expect(customView.stateSettings.appSettings.isWhiteBackground).toBe(false)
			expect(customView.stateSettings.appSettings.camera.x).toBe(1)
			expect(customView.stateSettings.appSettings.camera.y).toBe(2)
			expect(customView.stateSettings.appSettings.camera.z).toBe(3)

			// expect optional properties to have been copied
			expect(typeof customView.stateSettings.fileSettings.attributeTypes.nodes !== "undefined").toBe(true)
			expect(customView.stateSettings.fileSettings.attributeTypes.nodes.metric1).toBe(AttributeTypeValue.absolute)
			expect(customView.stateSettings.fileSettings.attributeTypes.nodes.metric2).toBe(AttributeTypeValue.relative)

			expect(typeof customView.stateSettings.fileSettings.attributeTypes.edges === "undefined").toBe(true)
		})
	})
})
