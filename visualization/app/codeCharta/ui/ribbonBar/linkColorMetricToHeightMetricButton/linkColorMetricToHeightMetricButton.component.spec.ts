import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { LinkColorMetricToHeightMetricButtonComponent } from "./linkColorMetricToHeightMetricButton.component"
import { Store } from "../../../state/store/store"
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
		const { container } = await render(LinkColorMetricToHeightMetricButtonComponent)

		expect(container.querySelector(".fa.fa-link")).not.toBe(null)
		expect(container.querySelector(".fa.fa-chain-broken")).toBe(null)
		expect(screen.queryByText("Unlink Height And Color Metric")).toBe(null)

		await userEvent.click(screen.getByTitle("Link Height And Color Metric"))

		expect(container.querySelector(".fa.fa-chain-broken")).not.toBe(null)
		expect(container.querySelector(".fa.fa-link")).toBe(null)
		expect(screen.getByTitle("Unlink Height And Color Metric")).not.toBe(null)
		expect(screen.queryByText("Link Height And Color Metric")).toBe(null)
	})
})
