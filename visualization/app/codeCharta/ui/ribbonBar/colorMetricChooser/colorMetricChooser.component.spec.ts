import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { setColorMetric } from "../../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { Store } from "../../../state/store/store"
import { ColorMetricChooserComponent } from "./colorMetricChooser.component"
import { ColorMetricChooserModule } from "./heightMetricChooser.module"
import { toggleLinkBetweenColorMetricAndHeightMetric } from "../../../state/store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetricActions"

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
		const nonDisabledColor = "color: rgba(68,68,68);"
		const { container } = await render(ColorMetricChooserComponent, { excludeComponentDeclaration: true })

		expect(screen.getByRole("combobox").getAttribute("aria-disabled")).toBe("false")

		await userEvent.click(await screen.findByText("aMetric (1)"))
		expect(screen.getByText("Color Metric (highest value)")).not.toBe(null)
		const options = screen.queryAllByRole("option")
		await expect(options[0].textContent).toMatch("aMetric (1)")
		await expect(options[1].textContent).toMatch("bMetric (2)")

		await userEvent.click(options[1])
		expect(screen.queryByText("aMetric (1)")).toBe(null)
		expect(screen.queryByText("bMetric (2)")).not.toBe(null)
		expect(container.querySelector(".fa.fa-paint-brush").getAttribute("style")).toEqual(nonDisabledColor)
	})

	it("should disable metric chooser when height and color metric are linked", async () => {
		Store.dispatch(toggleLinkBetweenColorMetricAndHeightMetric())
		const disabledColor = "color: rgba(0, 0, 0, 0.38);"
		const { container } = await render(ColorMetricChooserComponent, { excludeComponentDeclaration: true })

		expect(screen.getByRole("combobox").getAttribute("aria-disabled")).toBe("true")
		expect(container.querySelector(".fa.fa-paint-brush").getAttribute("style")).toEqual(disabledColor)
	})
})
