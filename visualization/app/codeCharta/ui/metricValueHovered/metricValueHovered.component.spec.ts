import "./metricValueHovered.module"
import { MetricValueHoveredController } from "./metricValueHovered.component"
import { instantiateModule } from "../../../../mocks/ng.mockhelper"

describe("MetricValueHoveredController", () => {
	let metricValueHoveredController: MetricValueHoveredController

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.metricValueHovered")
	}

	function rebuildController() {
		metricValueHoveredController = new MetricValueHoveredController()
	}

	describe("someMethodName", () => {
		it("should do something", () => {})
	})
})
