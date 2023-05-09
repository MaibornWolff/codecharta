import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { IdToBuildingService } from "../../../../services/idToBuilding/idToBuilding.service"
import { ThreeSceneService } from "../../../../ui/codeMap/threeViewer/threeSceneService"
import { VALID_FILE_NODE_WITH_ID, VALID_NODE_WITH_PATH } from "../../../../util/dataMocks"
import { NodeContextMenuCardComponent } from "./nodeContextMenuCard.component"
import { NodeContextMenuCardModule } from "./nodeContextMenuCard.module"
import { provideMockStore } from "@ngrx/store/testing"
import { rightClickedCodeMapNodeSelector } from "../rightClickedCodeMapNode.selector"

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

	it("should display all information", async () => {
		const { container } = await render(NodeContextMenuCardComponent, {
			excludeComponentDeclaration: true,
			providers: provideMockStore({ selectors: [{ selector: rightClickedCodeMapNodeSelector, value: VALID_NODE_WITH_PATH }] })
		})

		expect(screen.getByText("/root")).not.toBe(null)
		expect(screen.getByText("FOCUS")).not.toBe(null)
		expect(screen.getByText("FLATTEN")).not.toBe(null)
		expect(screen.getByText("KEEP HIGHLIGHT")).not.toBe(null)
		expect(screen.getByText("EXCLUDE")).not.toBe(null)
		expect(container.querySelector("cc-mark-folder-row")).not.toBe(null)
	})

	it("should not display mark folder option if node is a leaf", async () => {
		const { container } = await render(NodeContextMenuCardComponent, {
			excludeComponentDeclaration: true,
			providers: provideMockStore({ selectors: [{ selector: rightClickedCodeMapNodeSelector, value: VALID_FILE_NODE_WITH_ID }] })
		})
		expect(container.querySelector("cc-mark-folder-row")).toBe(null)
	})
})
