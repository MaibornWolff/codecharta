import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { LinkColorMetricToHeightMetricButtonComponent } from "./linkColorMetricToHeightMetricButton.component"
import { TestBed } from "@angular/core/testing"
import { CommonModule } from "@angular/common"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { isColorMetricLinkedToHeightMetricSelector } from "../../../state/store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.selector"
import { getLastAction } from "../../../util/testUtils/store.utils"
import { toggleIsColorMetricLinkedToHeightMetric } from "../../../state/store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.actions"

describe("linkHeightAndColorMetricComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [CommonModule],
			providers: [provideMockStore({ selectors: [{ selector: isColorMetricLinkedToHeightMetricSelector, value: false }] })]
		})
	})

	it("should toggle height and color metric link on click and show associated icon", async () => {
		const { container, detectChanges } = await render(LinkColorMetricToHeightMetricButtonComponent)

		expect(container.querySelector(".fa.fa-link")).not.toBe(null)
		expect(container.querySelector(".fa.fa-chain-broken")).toBe(null)
		expect(screen.queryByText("Unlink Height and Color Metric")).toBe(null)

		await userEvent.click(screen.getByTitle("Link Height and Color Metric"))
		const store = TestBed.inject(MockStore)
		expect(await getLastAction(store)).toEqual(toggleIsColorMetricLinkedToHeightMetric())

		store.overrideSelector(isColorMetricLinkedToHeightMetricSelector, true)
		store.refreshState()
		detectChanges()

		expect(container.querySelector(".fa.fa-chain-broken")).not.toBe(null)
		expect(container.querySelector(".fa.fa-link")).toBe(null)
		expect(screen.getByTitle("Unlink Height and Color Metric")).not.toBe(null)
		expect(screen.queryByText("Link Height and Color Metric")).toBe(null)
	})
})
