import "./metricDeltaSelected.module"
import { MetricDeltaSelectedController } from "./metricDeltaSelected.component"
import { instantiateModule } from "../../../../mocks/ng.mockhelper"

describe("MetricDeltaSelectedController", () => {
	let metricDeltaSelectedController: MetricDeltaSelectedController

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.metricDeltaSelected")
	}

	function rebuildController() {
		metricDeltaSelectedController = new MetricDeltaSelectedController()
	}

	describe("someMethodName", () => {
		it("should do something", () => {})
	})
})
