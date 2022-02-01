import { render, screen } from "@testing-library/angular"
import { TestBed } from "@angular/core/testing"
import userEvent from "@testing-library/user-event"
import { HighlightButtonsModule } from "./highlightButtons.module"
import { ThreeSceneServiceToken } from "../../../services/ajs-upgraded-providers"
import { HighlightButtonsComponent } from "./highlightButtons.component"
import { VALID_FILE_NODE_WITH_ID as codeMapNode } from "../../../util/dataMocks"
import { State } from "../../../state/angular-redux/state"
import { CodeMapNode } from "../../../codeCharta.model"

describe("flattenButtonsComponent", () => {
	let threeSceneService
	let state

	beforeEach(() => {
		threeSceneService = createMockedThreeSceneService()
		state = createMockedState()
		TestBed.configureTestingModule({
			imports: [HighlightButtonsModule],
			providers: [
				{ provide: ThreeSceneServiceToken, useValue: threeSceneService },
				{ provide: State, useValue: state }
			]
		})
	})

	it("should let a user permanently highlight and remove permanently highlight of a node", async () => {
		state.getValue().lookUp.idToBuilding.set(codeMapNode.id, { id: codeMapNode.id, node: codeMapNode })

		const { rerender } = await render(HighlightButtonsComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { codeMapNode }
		})

		expect(screen.queryByText("REMOVE HIGHLIGHT")).toBe(null)
		userEvent.click(screen.getByText("KEEP HIGHLIGHT"))

		rerender({ codeMapNode: null })
		rerender({ codeMapNode })

		expect(screen.queryByText("KEEP HIGHLIGHT")).toBe(null)
		userEvent.click(screen.getByText("REMOVE HIGHLIGHT"))

		rerender({ codeMapNode: null })
		rerender({ codeMapNode })

		expect(screen.queryByText("REMOVE HIGHLIGHT")).toBe(null)
		expect(screen.queryByText("KEEP HIGHLIGHT")).not.toBe(null)
	})

	function createMockedThreeSceneService() {
		const highlighted = new Map()
		return {
			addNodeAndChildrenToConstantHighlight: (node: CodeMapNode) => highlighted.set(node.id, node),
			removeNodeAndChildrenFromConstantHighlight: (node: CodeMapNode) => highlighted.delete(node.id),
			getConstantHighlight: () => highlighted
		}
	}

	function createMockedState() {
		const idToBuilding = new Map()
		return { getValue: () => ({ lookUp: { idToBuilding } }) }
	}
})
