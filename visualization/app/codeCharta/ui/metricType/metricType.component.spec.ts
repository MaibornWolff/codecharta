import "./metricType.module"
import { MetricTypeController } from "./metricType.component"
import { instantiateModule } from "../../../../mocks/ng.mockhelper"

describe("MetricTypeController", () => {
	let metricTypeController: MetricTypeController

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.metricType")
	}

	function rebuildController() {
		metricTypeController = new MetricTypeController()
	}

	describe("someMethodName", () => {
		it("should do something", () => {})
	})
})
