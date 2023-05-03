import { TestBed } from "@angular/core/testing"
import { render } from "@testing-library/angular"
import { HoveredNodePathPanelComponent } from "./hoveredNodePathPanel.component"
import { HoveredNodePathPanelModule } from "./hoveredNodePathPanel.module"
import { hoveredNodePathPanelDataSelector } from "./hoveredNodePathPanelData.selector"
import { provideMockStore } from "@ngrx/store/testing"

describe("HoveredNodePathPanelComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HoveredNodePathPanelModule]
		})
	})

	it("should be empty when there is no node hovered", async () => {
		const { container } = await render(HoveredNodePathPanelComponent, {
			excludeComponentDeclaration: true,
			providers: [provideMockStore({ selectors: [{ selector: hoveredNodePathPanelDataSelector, value: undefined }] })]
		})
		expect(container.textContent).toBe("")
	})

	it("should show path to a hovered file", async () => {
		const { container } = await render(HoveredNodePathPanelComponent, {
			excludeComponentDeclaration: true,
			providers: [
				provideMockStore({
					selectors: [
						{
							selector: hoveredNodePathPanelDataSelector,
							value: { path: ["root", "a.ts"], isFile: true }
						}
					]
				})
			]
		})

		const steps = container.children
		expect(steps.length).toBe(2)

		expect(steps[0].textContent).toBe("root")
		const iconOfFirstStep = steps[0].querySelector("i")
		expect(iconOfFirstStep.className).toBe("fa fa-angle-right")

		expect(steps[1].textContent).toBe("a.ts")
		const iconOfLastStep = steps[1].querySelector("i")
		expect(iconOfLastStep.className).toBe("fa fa-file-o")
	})

	it("should show path to a hovered folder", async () => {
		const { container } = await render(HoveredNodePathPanelComponent, {
			excludeComponentDeclaration: true,
			providers: [
				provideMockStore({
					selectors: [
						{
							selector: hoveredNodePathPanelDataSelector,
							value: { path: ["root"], isFile: false }
						}
					]
				})
			]
		})
		const steps = container.children
		expect(steps.length).toBe(1)

		expect(steps[0].textContent).toBe("root")
		const iconOfLastStep = steps[0].querySelector("i")
		expect(iconOfLastStep.className).toBe("fa fa-folder")
	})
})
