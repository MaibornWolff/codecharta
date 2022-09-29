import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { LinkHeightAndColorMetricButtonComponent } from "./linkHeightAndColorMetricButton.component"
import { Store } from "../../../state/store/store"
import { isHeightAndColorMetricLinkedSelector } from "../../../state/store/appSettings/isHeightAndColorMetricLinked/isHeightAndColorMetricLinked.selector"
import { TestBed } from "@angular/core/testing"
import { CommonModule } from "@angular/common"

describe("linkHeightAndColorMetricComponent", () => {
	beforeEach(() => {
		Store["initialize"]()
		TestBed.configureTestingModule({
			imports: [CommonModule]
		})
	})

	it("should toggle height and color metric link on click and show associated icon", async () => {
		const { container } = await render(LinkHeightAndColorMetricButtonComponent)
		const isHeightAndColorMetricLinked = isHeightAndColorMetricLinkedSelector(Store.store.getState())

		expect(container.getElementsByClassName("fa fa-chain-broken")[0].className).toEqual("fa fa-chain-broken")
		expect(container.getElementsByClassName("fa fa-link")[0]).toBeUndefined()
		expect(screen.queryByText("Unlink Height And Color Metric")).toBe(null)

		await userEvent.click(screen.getByTitle("Link Height And Color Metric"))

		expect(container.getElementsByClassName("fa fa-link")[0].className).toEqual("fa fa-link")
		expect(container.getElementsByClassName("fa fa-chain-broken")[0]).toBeUndefined()
		expect(screen.getByTitle("Unlink Height And Color Metric")).not.toBe(null)
		expect(screen.queryByText("Link Height And Color Metric")).toBe(null)
		expect(isHeightAndColorMetricLinkedSelector(Store.store.getState())).toBe(!isHeightAndColorMetricLinked)
	})
})
