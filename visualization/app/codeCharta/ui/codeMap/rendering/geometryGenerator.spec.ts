import "../codeMap.module"
import "../../../codeCharta.module"
import { Settings, Node } from "../../../codeCharta.model"
import { SETTINGS, TEST_NODES } from "../../../util/dataMocks"
import { GeometryGenerator } from "./geometryGenerator"

describe("geometryGenerator", () => {
	let geometryGenerator: GeometryGenerator

	let nodes: Node[]
	let settings: Settings

	function restartSystem() {
		nodes = JSON.parse(JSON.stringify(TEST_NODES))
		settings = JSON.parse(JSON.stringify(SETTINGS))
	}

	function rebuildService() {
		geometryGenerator = new GeometryGenerator()
	}

	beforeEach(() => {
		restartSystem()
		rebuildService()
	})

	describe("getBuildingColor", () => {
		let node: Node

		beforeEach(() => {
			node = nodes[0]
			node.attributes = { validMetircName: 0 }
			settings.appSettings.invertColorRange = false
			settings.appSettings.whiteColorBuildings = false
			settings.dynamicSettings.colorRange.from = 5
			settings.dynamicSettings.colorRange.to = 10
			settings.dynamicSettings.colorMetric = "validMetircName"
		})

		it("creates grey building for undefined colorMetric", () => {
			settings.dynamicSettings.colorMetric = "invalid"
			const buildingColor = geometryGenerator["getBuildingColor"](node, settings, false)
			expect(buildingColor).toBe(settings.appSettings.mapColors.base)
		})

		it("creates flat colored building", () => {
			node.flat = true

			const buildingColor = geometryGenerator["getBuildingColor"](node, settings, false)

			expect(buildingColor).toBe(settings.appSettings.mapColors.flat)
		})

		it("creates green colored building colorMetricValue < colorRangeFrom", () => {
			const buildingColor = geometryGenerator["getBuildingColor"](node, settings, false)

			expect(buildingColor).toBe(settings.appSettings.mapColors.positive)
		})

		it("creates white colored building colorMetricValue < colorRangeFrom", () => {
			settings.appSettings.whiteColorBuildings = true

			const buildingColor = geometryGenerator["getBuildingColor"](node, settings, false)

			expect(buildingColor).toBe(settings.appSettings.mapColors.lightGrey)
		})

		it("creates red colored building colorMetricValue < colorRangeFrom with inverted range", () => {
			settings.appSettings.invertColorRange = true

			const buildingColor = geometryGenerator["getBuildingColor"](node, settings, false)

			expect(buildingColor).toBe(settings.appSettings.mapColors.negative)
		})

		it("creates red colored building colorMetricValue > colorRangeFrom", () => {
			node.attributes = { validMetircName: 12 }

			const buildingColor = geometryGenerator["getBuildingColor"](node, settings, false)

			expect(buildingColor).toBe(settings.appSettings.mapColors.negative)
		})

		it("creates green colored building colorMetricValue > colorRangeFrom with inverted range", () => {
			settings.appSettings.invertColorRange = true
			node.attributes = { validMetircName: 12 }

			const buildingColor = geometryGenerator["getBuildingColor"](node, settings, false)

			expect(buildingColor).toBe(settings.appSettings.mapColors.positive)
		})

		it("creates white colored building colorMetricValue > colorRangeFrom with inverted range", () => {
			settings.appSettings.invertColorRange = true
			settings.appSettings.whiteColorBuildings = true
			node.attributes = { validMetircName: 12 }

			const buildingColor = geometryGenerator["getBuildingColor"](node, settings, false)

			expect(buildingColor).toBe(settings.appSettings.mapColors.lightGrey)
		})

		it("creates yellow colored building", () => {
			node.attributes = { validMetircName: 7 }
			const buildingColor = geometryGenerator["getBuildingColor"](node, settings, false)
			expect(buildingColor).toBe(settings.appSettings.mapColors.neutral)
		})
	})
})
