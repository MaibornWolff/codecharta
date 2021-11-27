import { render } from "@testing-library/angular"

import { selectedBuildingSelector } from "../../../../state/selectors/selectedBuilding.selector"
import { Store } from "../../../../state/store/store"
import { CodeMapBuilding } from "../../../codeMap/rendering/codeMapBuilding"
import { NodePathComponent } from "./nodePath.component"

jest.mock("../../../state/selectors/selectedBuilding.selector", () => ({
	selectedBuildingSelector: jest.fn()
}))

const selectedBuildingSelectorMock = selectedBuildingSelector as unknown as jest.Mock<ReturnType<typeof selectedBuildingSelector>>

describe("nodePathComponent", () => {
	beforeEach(() => {
		Store["initialize"]()
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it("should display an empty p tag, if no building is selected", async () => {
		const { container } = await render(NodePathComponent)
		const pTag = container.querySelector("p")

		expect(pTag).not.toBe(null)
		expect(pTag.textContent).toBe("")
	})

	it("should display only node path, when a file is selected", async () => {
		selectedBuildingSelectorMock.mockImplementation(
			() =>
				({
					node: {
						isLeaf: true,
						path: "some/file.ts"
					}
				} as unknown as CodeMapBuilding)
		)

		const { container } = await render(NodePathComponent)
		expect(container.textContent).toContain("some/file.ts")
	})

	it("should display node path and fileCountDescription,, when a folder is selected", async () => {
		selectedBuildingSelectorMock.mockImplementation(
			() =>
				({
					node: {
						isLeaf: false,
						path: "some/folder",
						attributes: { unary: 2 }
					}
				} as unknown as CodeMapBuilding)
		)

		const { container } = await render(NodePathComponent)
		expect(container.textContent.replace(/\s+/g, " ")).toContain("some/folder (2 files)")
	})
})
