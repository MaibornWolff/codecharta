import { TestBed } from "@angular/core/testing"
import { fireEvent, render } from "@testing-library/angular"
import { MarkFolderRowComponent } from "./markFolderRow.component"
import { MarkFolderRowModule } from "./markFolderRow.module"

jest.mock("../rightClickedCodeMapNode.selector", () => ({
	rightClickedCodeMapNodeSelector: () => ({ path: "/root" })
}))

describe("markFolderRow component", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [MarkFolderRowModule]
		})
	})

	it("should let a user mark and unmark a node", async () => {
		const { container } = await render(MarkFolderRowComponent, { excludeComponentDeclaration: true })

		expect(container.querySelectorAll("button").length).toBe(5)
		expect(container.querySelectorAll("cc-color-picker").length).toBe(1)
		expect(container.querySelectorAll(".fa-times").length).toBe(0)

		fireEvent.click(getFirstColorButton(container))
		expect(container.querySelectorAll(".fa-times").length).toBe(1)
		expect(getFirstColorButton(container).querySelector(".fa-times")).not.toBe(null)

		fireEvent.click(getFirstColorButton(container))
		expect(container.querySelectorAll(".fa-times").length).toBe(0)

		function getFirstColorButton(container: Element) {
			return container.querySelectorAll("button[title='Colorize folder']")[0]
		}
	})
})
