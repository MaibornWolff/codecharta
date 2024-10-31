import { render, screen } from "@testing-library/angular"
import { TestBed } from "@angular/core/testing"
import userEvent from "@testing-library/user-event"
import { HighlightButtonsComponent } from "./highlightButtons.component"
import { CodeMapNode } from "../../../../codeCharta.model"
import { IdToBuildingService } from "../../../../services/idToBuilding/idToBuilding.service"
import { CodeMapBuilding } from "../../../../ui/codeMap/rendering/codeMapBuilding"
import { ThreeSceneService } from "../../../../ui/codeMap/threeViewer/threeSceneService"

describe("flattenButtonsComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HighlightButtonsComponent]
        })
    })

    it("should let a user permanently highlight and remove permanently highlight of a node", async () => {
        const idToBuilding = new IdToBuildingService()
        idToBuilding.setIdToBuilding([{ id: 0, node: { id: 0 } } as unknown as CodeMapBuilding])

        const { rerender } = await render(HighlightButtonsComponent, {
            excludeComponentDeclaration: true,
            componentProperties: { codeMapNode: { id: 0 } },
            providers: [
                { provide: IdToBuildingService, useValue: idToBuilding },
                { provide: ThreeSceneService, useValue: createMockedThreeSceneService() }
            ]
        })

        expect(screen.queryByText("REMOVE HIGHLIGHT")).toBe(null)
        await userEvent.click(screen.getByText("KEEP HIGHLIGHT"))

        await rerender({ componentProperties: { codeMapNode: undefined } })
        await rerender({ componentProperties: { codeMapNode: { id: 0 } } })

        expect(screen.queryByText("KEEP HIGHLIGHT")).toBe(null)
        await userEvent.click(screen.getByText("REMOVE HIGHLIGHT"))

        await rerender({ componentProperties: { codeMapNode: undefined } })
        await rerender({ componentProperties: { codeMapNode: { id: 0 } } })

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
})
