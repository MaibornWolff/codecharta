import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { expect } from "@jest/globals"
import userEvent from "@testing-library/user-event"
import { setAreaMetric } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { Store } from "../../../state/store/store"
import { AreaMetricChooserComponent } from "./areaMetricChooser.component"
import { AreaMetricChooserModule } from "./areaMetricChooser.module"

jest.mock("../../../state/selectors/accumulatedData/metricData/nodeMetricData.selector", () => ({
	nodeMetricDataSelector: () => [
		{ key: "aMetric", maxValue: 1 },
		{ key: "bMetric", maxValue: 2 }
	]
}))

describe("areaMetricChooserComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [AreaMetricChooserModule]
		})
	})

	it("should be a select for area metric", async () => {
		Store.dispatch(setAreaMetric("aMetric"))
		await render(AreaMetricChooserComponent, { excludeComponentDeclaration: true })

		await userEvent.click(await screen.findByText("aMetric (1)"))
		expect(screen.getByText("Area Metric (highest value)")).not.toBe(null)
		const options = screen.queryAllByRole("option")
		expect(options[0].textContent).toMatch("aMetric (1)")
		expect(options[1].textContent).toMatch("bMetric (2)")

		await userEvent.click(options[1])
		expect(screen.queryByText("aMetric (1)")).toBe(null)
		expect(screen.queryByText("bMetric (2)")).not.toBe(null)
	})
})
