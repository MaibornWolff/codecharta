import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { setColorMetric } from "../../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { Store } from "../../../state/store/store"
import { ColorMetricChooserComponent } from "./colorMetricChooser.component"
import { ColorMetricChooserModule } from "./heightMetricChooser.module"
import { toggleHeightAndColorMetricLink } from "../../../state/store/appSettings/isHeightAndColorMetricLinked/isHeightAndColorMetricLinked.actions"

jest.mock("../../../state/selectors/accumulatedData/metricData/nodeMetricData.selector", () => ({
	nodeMetricDataSelector: () => [
		{ name: "aMetric", maxValue: 1 },
		{ name: "bMetric", maxValue: 2 }
	]
}))

describe("colorMetricChooserComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ColorMetricChooserModule]
		})
	})

	it("should be a select for color metric", async () => {
		Store.dispatch(setColorMetric("aMetric"))
		await render(ColorMetricChooserComponent, { excludeComponentDeclaration: true })

		expect(screen.getByRole("combobox").getAttribute("aria-disabled")).toBeFalsy()

		await userEvent.click(await screen.findByText("aMetric (1)"))
		expect(screen.getByText("Color Metric (highest value)")).not.toBe(null)
		const options = screen.queryAllByRole("option")
		await expect(options[0].textContent).toMatch("aMetric (1)")
		await expect(options[1].textContent).toMatch("bMetric (2)")

		await userEvent.click(options[1])
		expect(screen.queryByText("aMetric (1)")).toBe(null)
		expect(screen.queryByText("bMetric (2)")).not.toBe(null)
	})

	it("should disable metric chooser when height and color metric is linked", async () => {
		Store.dispatch(toggleHeightAndColorMetricLink())

		await render(ColorMetricChooserComponent, { excludeComponentDeclaration: true })

		expect(screen.getByRole("combobox").getAttribute("aria-disabled")).toBeTruthy()
	})
})
