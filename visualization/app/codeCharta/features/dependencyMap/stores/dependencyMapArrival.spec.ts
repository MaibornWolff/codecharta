import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { LeveledNode } from "../../../renderer/dependencyGraph/dependencyGraph.facade"
import { currentFocusedNodePathSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { unfocusNode } from "../../../stores/sharedView/sharedView.write.facade"
import { dependencyLayoutIdentitySelector } from "../selectors/dependencyMap.selectors"
import { DependencyMapArrival } from "./dependencyMapArrival"
import { DependencyMapViewStore } from "./dependencyMapView.store"

const FOCUSED_FOLDER = "/root/src"
const FOCUSED_LAYOUT = "focused on src"
const UNFOCUSED_LAYOUT = "unfocused"

function leveledFolder(path: string, children: LeveledNode[] = []): LeveledNode {
    return { path, name: path.split("/").pop(), level: 0, kind: "folder", children }
}

describe("DependencyMapArrival", () => {
    function setup(focusedNodePath: string | undefined) {
        TestBed.configureTestingModule({
            providers: [
                DependencyMapArrival,
                provideMockStore({
                    selectors: [
                        { selector: currentFocusedNodePathSelector, value: focusedNodePath },
                        { selector: dependencyLayoutIdentitySelector, value: focusedNodePath ? FOCUSED_LAYOUT : UNFOCUSED_LAYOUT }
                    ]
                })
            ]
        })
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        return { arrival: TestBed.inject(DependencyMapArrival), viewStore: TestBed.inject(DependencyMapViewStore), store, dispatchSpy }
    }

    it("should ask the graph to fit into view once for every node that arrives", () => {
        // Arrange
        const { arrival, viewStore } = setup(undefined)

        // Act
        arrival.receive("/root/src/a.ts")
        arrival.receive("/root/lib/b.ts")

        // Assert
        expect(viewStore.fitRequest()).toBe(2)
    })

    it.each(["/root/src/ui/view.ts", FOCUSED_FOLDER])("should keep the focus when %s lies inside it", nodePath => {
        // Arrange
        const { arrival, dispatchSpy } = setup(FOCUSED_FOLDER)

        // Act
        arrival.receive(nodePath)

        // Assert
        expect(dispatchSpy).not.toHaveBeenCalled()
    })

    it.each(["/root/lib/b.ts", "/root/srcgen/c.ts"])("should clear the focus when %s lies outside it", nodePath => {
        // Arrange
        const { arrival, dispatchSpy } = setup(FOCUSED_FOLDER)

        // Act
        arrival.receive(nodePath)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(unfocusNode())
    })

    it("should reveal a node from outside the focus once the graph adopts the unfocused tree", () => {
        // Arrange
        const nodePath = "/root/lib/util/strings.ts"
        const { arrival, viewStore, store } = setup(FOCUSED_FOLDER)
        viewStore.adoptTree(leveledFolder(FOCUSED_FOLDER, [leveledFolder("/root/src/ui")]))
        const unfocusInTheStore = () => {
            store.overrideSelector(currentFocusedNodePathSelector, undefined)
            store.overrideSelector(dependencyLayoutIdentitySelector, UNFOCUSED_LAYOUT)
            store.refreshState()
        }

        // Act
        arrival.receive(nodePath)
        unfocusInTheStore()
        viewStore.reveal([nodePath])
        viewStore.adoptTree(
            leveledFolder("/root", [leveledFolder(FOCUSED_FOLDER), leveledFolder("/root/lib", [leveledFolder("/root/lib/util")])])
        )

        // Assert
        expect([...viewStore.expandedPaths()]).toEqual(["/root", "/root/lib", "/root/lib/util"])
    })
})
