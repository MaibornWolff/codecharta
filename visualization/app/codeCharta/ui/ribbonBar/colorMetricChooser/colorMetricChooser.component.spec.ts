import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { expect } from "@jest/globals"
import userEvent from "@testing-library/user-event"
import { setColorMetric } from "../../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { Store } from "../../../state/store/store"
import { ColorMetricChooserComponent } from "./colorMetricChooser.component"
import { ColorMetricChooserModule } from "./heightMetricChooser.module"
import { toggleIsColorMetricLinkedToHeightMetric } from "../../../state/store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.actions"

jest.mock("../../../state/selectors/accumulatedData/metricData/metricData.selector", () => ({
	metricDataSelector: () => ({
		nodeMetricData: [
			{ name: "aMetric", maxValue: 1 },
			{ name: "bMetric", maxValue: 2 }
		],
		edgeMetricData: []
	})
}))

describe("colorMetricChooserComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ColorMetricChooserModule]
		})
	})

	it("should be a select for color metric", async () => {
		const nonDisabledIconColor = "color: rgb(68, 68, 68);"
		Store.dispatch(setColorMetric("aMetric"))

		const { container } = await render(ColorMetricChooserComponent, { excludeComponentDeclaration: true })

		expect(screen.getByRole("combobox").getAttribute("aria-disabled")).toBe("false")

		await userEvent.click(await screen.findByText("aMetric (1)"))
		expect(screen.getByPlaceholderText("Color Metric (highest value)")).not.toBe(null)
		const options = screen.queryAllByRole("option")
		expect(options[0].textContent).toMatch("aMetric (1)")
		expect(options[1].textContent).toMatch("bMetric (2)")

		await userEvent.click(options[1])
		expect(screen.queryByText("aMetric (1)")).toBe(null)
		expect(screen.queryByText("bMetric (2)")).not.toBe(null)
		expect(container.querySelector(".fa.fa-paint-brush").getAttribute("style")).toEqual(nonDisabledIconColor)
	})

	it("should disable metric chooser when height and color metric are linked", async () => {
		Store.dispatch(toggleIsColorMetricLinkedToHeightMetric())
		const disabledIconColor = "color: rgba(0, 0, 0, 0.38);"
		const { container } = await render(ColorMetricChooserComponent, { excludeComponentDeclaration: true })

		expect(screen.getByRole("combobox").getAttribute("aria-disabled")).toBe("true")
		expect(container.querySelector(".fa.fa-paint-brush").getAttribute("style")).toEqual(disabledIconColor)
	})
})
