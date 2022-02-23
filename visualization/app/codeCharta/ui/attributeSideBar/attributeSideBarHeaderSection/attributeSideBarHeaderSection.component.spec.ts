import { TestBed } from "@angular/core/testing"
import { render, fireEvent } from "@testing-library/angular"

import { LazyLoader } from "../../../util/lazyLoader"
import { AttributeSideBarModule } from "../attributeSideBar.module"
import { AttributeSideBarHeaderSectionComponent } from "./attributeSideBarHeaderSection.component"

describe("attributeSideBarHeaderSection", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [AttributeSideBarModule]
		})
	})

	it("should have file opener when given node has no link and open it on click if it is a leaf", async () => {
		const { container } = await render(AttributeSideBarHeaderSectionComponent, {
			excludeComponentDeclaration: true,
			componentProperties: {
				node: { name: "myNode", isLeaf: true, path: "./myNode.ts", link: undefined },
				fileName: "myNode.ts"
			}
		})

		expect(container.querySelector("[data-testid=file-link]")).toBe(null)
		const fileOpener = container.querySelector("[data-testid=file-opener]")
		expect(fileOpener).not.toBe(null)

		// @ts-ignore
		const openFileMock = jest.spyOn(LazyLoader, "openFile").mockImplementation(() => {})
		fireEvent.click(fileOpener)

		expect(openFileMock).toHaveBeenCalledWith("myNode.ts", "./myNode.ts")
	})

	it("should have file opener when given node has no link but don't open it on click if it isn't a leaf", async () => {
		const { container } = await render(AttributeSideBarHeaderSectionComponent, {
			excludeComponentDeclaration: true,
			componentProperties: {
				node: { name: "myNode", isLeaf: false, path: "./myNode.ts", link: undefined },
				fileName: "myNode.ts"
			}
		})

		expect(container.querySelector("[data-testid=file-link]")).toBe(null)
		const fileOpener = container.querySelector("[data-testid=file-opener]")
		expect(fileOpener).not.toBe(null)

		// @ts-ignore
		const openFileMock = jest.spyOn(LazyLoader, "openFile").mockReset()
		fireEvent.click(fileOpener)

		expect(openFileMock).not.toHaveBeenCalled()
	})

	it("should have file link when given node has a link", async () => {
		const { container } = await render(AttributeSideBarHeaderSectionComponent, {
			excludeComponentDeclaration: true,
			componentProperties: {
				node: { name: "myNode", isLeaf: true, path: "./myNode.ts", link: "myNode.com" },
				fileName: "myNode.ts"
			}
		})

		expect(container.querySelector("[data-testid=file-opener]")).toBe(null)
		expect(container.querySelector("[data-testid=file-link] a[href='myNode.com']")).not.toBe(null)
	})
})
