import { TestBed } from "@angular/core/testing"
import { Store } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { DependencyMapViewStore } from "../../../features/dependencyMap/facade"
import { provideMockState } from "../../../mocks/state.mocks"
import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { hoveredNodePathSelector, selectedNodePathSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { setHoveredNodePath, setSelectedNodePath } from "../../../stores/sharedView/sharedView.write.facade"
import { DependencyExplorerSelection } from "./dependencyExplorerSelection"

const LEAF = { name: "view.ts", path: "/root/app/ui/view.ts", id: 2, type: NodeType.FILE, attributes: {} } as unknown as CodeMapNode

describe("DependencyExplorerSelection", () => {
    function setup(selectedNodePath: string | null = null, hoveredNodePath: string | null = null) {
        TestBed.configureTestingModule({
            providers: [
                DependencyExplorerSelection,
                provideMockState(),
                provideMockStore({
                    selectors: [
                        { selector: selectedNodePathSelector, value: selectedNodePath },
                        { selector: hoveredNodePathSelector, value: hoveredNodePath }
                    ]
                })
            ]
        })
        const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")
        return { selection: TestBed.inject(DependencyExplorerSelection), dispatchSpy }
    }

    it("should select the node in every view and open the folders holding it in the graph", () => {
        // Arrange
        const { selection, dispatchSpy } = setup()

        // Act
        selection.select(LEAF)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setSelectedNodePath({ value: LEAF.path }))
        expect([...TestBed.inject(DependencyMapViewStore).expandedPaths()]).toEqual(["/root", "/root/app", "/root/app/ui"])
    })

    it("should clear the selection on deselect", () => {
        // Arrange
        const { selection, dispatchSpy } = setup()

        // Act
        selection.deselect()

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setSelectedNodePath({ value: null }))
    })

    it("should hover the node, so the graph marks its box, until the hover ends", () => {
        // Arrange
        const { selection, dispatchSpy } = setup()

        // Act
        selection.hover(LEAF)
        selection.hoverEnd()

        // Assert
        expect(dispatchSpy.mock.calls).toEqual([[setHoveredNodePath({ value: LEAF.path })], [setHoveredNodePath({ value: null })]])
    })

    it("should report a row selected or hovered from the shared view state", () => {
        // Arrange
        const { selection } = setup(LEAF.path, LEAF.path)

        // Act
        const marks = [selection.isSelected(LEAF), selection.isHovered(LEAF)]

        // Assert
        expect(marks).toEqual([true, true])
    })
})
