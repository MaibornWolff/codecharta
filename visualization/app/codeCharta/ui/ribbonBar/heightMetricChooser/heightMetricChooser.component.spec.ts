import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { expect } from "@jest/globals"
import userEvent from "@testing-library/user-event"
import { setHeightMetric } from "../../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { Store } from "../../../state/store/store"
import { HeightMetricChooserComponent } from "./areaMetricChooser.component"
import { HeightMetricChooserModule } from "./heightMetricChooser.module"

jest.mock("../../../state/selectors/accumulatedData/metricData/metricData.selector", () => ({
	metricDataSelector: () => ({
		nodeMetricData: [
			{ name: "aMetric", maxValue: 1 },
			{ name: "bMetric", maxValue: 2 }
		],
		edgeMetricData: []
	})
}))

describe("heightMetricChooserComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HeightMetricChooserModule]
		})
	})

	it("should be a select for height metric", async () => {
		Store.dispatch(setHeightMetric("aMetric"))
		await render(HeightMetricChooserComponent, { excludeComponentDeclaration: true })

		await userEvent.click(await screen.findByText("aMetric (1)"))
		expect(screen.getByText("Height Metric (highest value)")).not.toBe(null)
		const options = screen.queryAllByRole("option")
		expect(options[0].textContent).toMatch("aMetric (1)")
		expect(options[1].textContent).toMatch("bMetric (2)")

		await userEvent.click(options[1])
		expect(screen.queryByText("aMetric (1)")).toBe(null)
		expect(screen.queryByText("bMetric (2)")).not.toBe(null)
	})
})
