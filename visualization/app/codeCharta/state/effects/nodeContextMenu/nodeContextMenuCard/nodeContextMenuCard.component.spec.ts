import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { IdToBuildingService } from "../../../../services/idToBuilding/idToBuilding.service"
import { ThreeSceneService } from "../../../../ui/codeMap/threeViewer/threeSceneService"
import { VALID_FILE_NODE_WITH_ID, VALID_NODE_WITH_PATH } from "../../../../util/dataMocks"
import { rightClickedCodeMapNodeSelector } from "../rightClickedCodeMapNode.selector"
import { NodeContextMenuCardComponent } from "./nodeContextMenuCard.component"
import { NodeContextMenuCardModule } from "./nodeContextMenuCard.module"

jest.mock("../rightClickedCodeMapNode.selector", () => ({
	rightClickedCodeMapNodeSelector: jest.fn()
}))
const mockedRightClickedCodeMapNodeSelector = jest.mocked(rightClickedCodeMapNodeSelector)

describe("NodeContextMenuCardComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [NodeContextMenuCardModule],
			providers: [
				{
					provide: ThreeSceneService,
					useValue: {
						addNodeAndChildrenToConstantHighlight: jest.fn(),
						removeNodeAndChildrenFromConstantHighlight: jest.fn(),
						getConstantHighlight: jest.fn()
					}
				},
				IdToBuildingService
			]
		})
	})

	it("should not display mark folder option if node is a leaf", async () => {
		mockedRightClickedCodeMapNodeSelector.mockImplementation(() => VALID_FILE_NODE_WITH_ID)
		await render(NodeContextMenuCardComponent, { excludeComponentDeclaration: true })
		expect(screen.queryByTitle("Colorize folder")).toBe(null)
	})

	it("should display all information", async () => {
		mockedRightClickedCodeMapNodeSelector.mockImplementation(() => VALID_NODE_WITH_PATH)
		await render(NodeContextMenuCardComponent, { excludeComponentDeclaration: true })

		expect(screen.queryByText("/root")).not.toBe(null)
		expect(screen.queryByText("FOCUS")).not.toBe(null)
		expect(screen.queryByText("FLATTEN")).not.toBe(null)
		expect(screen.queryByText("KEEP HIGHLIGHT")).not.toBe(null)
		expect(screen.queryByText("EXCLUDE")).not.toBe(null)
		expect(screen.queryAllByTitle("Colorize folder").length).toBe(5)
	})
})
