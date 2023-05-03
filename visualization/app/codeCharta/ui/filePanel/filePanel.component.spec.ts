import { FilePanelComponent } from "./filePanel.component"
import { TestBed } from "@angular/core/testing"
import { FilePanelModule } from "./filePanel.module"
import { render } from "@testing-library/angular"
import { isDeltaStateSelector } from "../../state/selectors/isDeltaState.selector"
import { provideMockStore } from "@ngrx/store/testing"
import { State } from "@ngrx/store"

describe("filePanelComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [FilePanelModule],
			providers: [{ provide: State, useValue: {} }]
		})
	})

	it("should render delta-selector when in delta mode", async () => {
		const { container } = await render(FilePanelComponent, {
			excludeComponentDeclaration: true,
			providers: [provideMockStore({ selectors: [{ selector: isDeltaStateSelector, value: true }] })]
		})
		expect(container.querySelector("cc-file-panel-delta-selector")).not.toBe(null)
		expect(container.querySelector("cc-file-panel-file-selector")).toBe(null)
	})

	it("should render file-selector when not in delta mode", async () => {
		const { container } = await render(FilePanelComponent, {
			excludeComponentDeclaration: true,
			providers: [provideMockStore({ selectors: [{ selector: isDeltaStateSelector, value: false }] })]
		})
		expect(container.querySelector("cc-file-panel-file-selector")).not.toBe(null)
		expect(container.querySelector("cc-file-panel-delta-selector")).toBe(null)
	})
})
