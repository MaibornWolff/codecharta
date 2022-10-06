import { render } from "@testing-library/angular"
import { TestBed } from "@angular/core/testing"
import { expect } from "@jest/globals"
import { FocusButtonsComponent } from "./focusButtons.component"
import { FocusButtonsModule } from "./focusButtons.module"
import { focusedNodePathSelector } from "../../../store/dynamicSettings/focusedNodePath/focusedNodePath.selector"

jest.mock("../../../store/dynamicSettings/focusedNodePath/focusedNodePath.selector", () => ({
	focusedNodePathSelector: jest.fn()
}))
const mockedFocusedNodePathSelector = focusedNodePathSelector as jest.Mock

describe("focusButton", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [FocusButtonsModule]
		})
	})
	it("should render only 'focus' button if neither node nor one of its parents is focused", async () => {
		const { container } = await render(FocusButtonsComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { codeMapNode: { path: "/root/foo" } }
		})

		const buttons = container.querySelectorAll("button")
		expect(buttons.length).toBe(1)
		expect(buttons[0].textContent).toMatch(" FOCUS ")
	})

	it("should render 'focus' and 'unfocus parent' buttons if a parent is focused", async () => {
		mockedFocusedNodePathSelector.mockImplementation(() => ["/root/foo"])
		const { container } = await render(FocusButtonsComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { codeMapNode: { path: "/root/foo/bar" } }
		})

		const buttons = container.querySelectorAll("button")
		expect(buttons.length).toBe(2)
		expect(buttons[0].textContent).toMatch(" FOCUS ")
		expect(buttons[1].textContent).toMatch("UNFOCUS PARENT")
	})

	it("should render 'unfocus' and 'unfocus all' buttons if node is focused and there was node focused before", async () => {
		mockedFocusedNodePathSelector.mockImplementation(() => ["/root/foo", "/root/bar"])
		const { container } = await render(FocusButtonsComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { codeMapNode: { path: "/root/foo" } }
		})

		const buttons = container.querySelectorAll("button")
		expect(buttons.length).toBe(2)
		expect(buttons[0].textContent).toMatch("UNFOCUS")
		expect(buttons[1].textContent).toMatch("UNFOCUS ALL")
	})
})
