import { render } from "@testing-library/angular"

import { Node } from "../../../../codeCharta.model"
import { selectedNodeSelector } from "../../../../state/selectors/selectedNode.selector"
import { NodePathComponent } from "./nodePath.component"

jest.mock("../../../../state/selectors/selectedNode.selector", () => ({
	selectedNodeSelector: jest.fn()
}))
const selectedNodeSelectorMock = selectedNodeSelector as unknown as jest.Mock<ReturnType<typeof selectedNodeSelector>>

describe("nodePathComponent", () => {
	it("should display an empty p tag, if no building is selected", async () => {
		const { container } = await render(NodePathComponent, { componentProperties: { node: undefined } })
		const pTag = container.querySelector("p")

		expect(pTag).not.toBe(null)
		expect(pTag.textContent).toBe("")
	})

	it("should display only node path, when a file is selected", async () => {
		const node = { isLeaf: true, path: "some/file.ts" } as unknown as Node
		selectedNodeSelectorMock.mockImplementation(() => node)

		const { container } = await render(NodePathComponent, { componentProperties: { node } })
		expect(container.textContent).toContain("some/file.ts")
	})

	it("should display node path and fileCountDescription,, when a folder is selected", async () => {
		const node = {
			isLeaf: false,
			path: "some/folder",
			attributes: { unary: 2 }
		} as unknown as Node
		selectedNodeSelectorMock.mockImplementation(() => node)

		const { container } = await render(NodePathComponent, { componentProperties: { node } })
		expect(container.textContent.replace(/\s+/g, " ")).toContain("some/folder (2 files)")
	})
})
