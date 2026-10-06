import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { LeveledNode } from "../../../renderer/dependencyGraph/dependencyGraph.facade"
import { dependencyLayoutIdentitySelector } from "../selectors/dependencyMap.selectors"
import { DependencyMapViewStore } from "./dependencyMapView.store"

function leveledFolder(path: string, children: LeveledNode[] = []): LeveledNode {
    return { path, name: path.split("/").pop(), level: 0, kind: "folder", children }
}

const PROJECT_A = "project A"
const PROJECT_B = "project B"
const TWO_TOP_FOLDERS = leveledFolder("/root", [leveledFolder("/root/src", [leveledFolder("/root/src/ui")]), leveledFolder("/root/lib")])

describe("DependencyMapViewStore", () => {
    let store: DependencyMapViewStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideMockStore({ selectors: [{ selector: dependencyLayoutIdentitySelector, value: PROJECT_A }] })]
        })
        mockStore = TestBed.inject(MockStore)
        store = TestBed.inject(DependencyMapViewStore)
    })

    function loadLayoutIdentity(layoutIdentity: string) {
        mockStore.overrideSelector(dependencyLayoutIdentitySelector, layoutIdentity)
        mockStore.refreshState()
    }

    it("should open only the root when it meets a tree, so every folder in it starts closed", () => {
        // Arrange
        const tree = leveledFolder("/root", [leveledFolder("/root/app", [leveledFolder("/root/app/ui")]), leveledFolder("/root/lib")])

        // Act
        store.adoptTree(tree)

        // Assert
        expect([...store.expandedPaths()]).toEqual(["/root"])
        expect(store.adoptedLayoutIdentity()).toBe(PROJECT_A)
    })

    it("should keep what the reader opened and moved while the same files and focus stay, even when the tree's root moves", () => {
        // Arrange
        store.adoptTree(TWO_TOP_FOLDERS)
        store.toggle("/root/src")
        store.placeBox("/root/src", [200, 0])

        // Act
        store.adoptTree(leveledFolder("/root/src", [leveledFolder("/root/src/ui")]))

        // Assert
        expect(store.expandedPaths().has("/root/src")).toBe(true)
        expect(store.boxOffsets().get("/root/src")).toEqual([200, 0])
    })

    it("should open the root an exclusion folds the last folder into, keeping what the reader opened and moved", () => {
        // Arrange
        store.adoptTree(TWO_TOP_FOLDERS)
        store.toggle("/root/lib")
        store.placeBox("/root/lib", [200, 0])
        const foldedRoot = {
            ...leveledFolder("/root/src", [leveledFolder("/root/src/ui"), leveledFolder("/root/src/api")]),
            foldedPaths: ["/root"]
        }

        // Act
        store.adoptTree(foldedRoot)

        // Assert
        expect([...store.expandedPaths()]).toEqual(["/root", "/root/lib", "/root/src"])
        expect(store.boxOffsets().get("/root/lib")).toEqual([200, 0])
    })

    it("should leave a root the reader closed closed while the tree's root stays where it is", () => {
        // Arrange
        store.adoptTree(TWO_TOP_FOLDERS)
        store.toggle("/root")

        // Act
        store.adoptTree(leveledFolder("/root", [leveledFolder("/root/src")]))

        // Assert
        expect(store.expandedPaths().has("/root")).toBe(false)
    })

    it("should count the requests to fit the whole graph into view", () => {
        // Arrange
        const before = store.fitRequest()

        // Act
        store.requestFit()
        store.requestFit()

        // Assert
        expect([before, store.fitRequest()]).toEqual([0, 2])
    })

    it("should keep a reveal made while the focus changes until the tree of the new focus is adopted", () => {
        // Arrange
        store.adoptTree(leveledFolder("/root/src", [leveledFolder("/root/src/ui")]))
        loadLayoutIdentity(PROJECT_B)
        store.reveal("/root/lib/util/strings.ts")

        // Act
        store.adoptTree(leveledFolder("/root", [leveledFolder("/root/src"), leveledFolder("/root/lib", [leveledFolder("/root/lib/util")])]))

        // Assert
        expect([...store.expandedPaths()]).toEqual(["/root", "/root/lib", "/root/lib/util"])
    })

    it("should start over with nothing opened or moved when other files with the same root are loaded", () => {
        // Arrange
        store.adoptTree(TWO_TOP_FOLDERS)
        store.toggle("/root/src")
        store.placeBox("/root/src", [200, 0])
        loadLayoutIdentity(PROJECT_B)

        // Act
        store.adoptTree(TWO_TOP_FOLDERS)

        // Assert
        expect([...store.expandedPaths()]).toEqual(["/root"])
        expect(store.boxOffsets().size).toBe(0)
        expect(store.adoptedLayoutIdentity()).toBe(PROJECT_B)
    })

    it("should open a closed folder and close an open one", () => {
        // Arrange
        const folderPath = "/root/app"

        // Act
        store.toggle(folderPath)
        const afterOpening = store.expandedPaths().has(folderPath)
        store.toggle(folderPath)

        // Assert
        expect(afterOpening).toBe(true)
        expect(store.expandedPaths().has(folderPath)).toBe(false)
    })

    it("should keep where the reader put a box until the layout is reset", () => {
        // Arrange
        const offset: [number, number] = [20, 10]

        // Act
        store.placeBox("/root/app", offset)
        const placed = store.boxOffsets().get("/root/app")
        store.resetLayout()

        // Assert
        expect(placed).toEqual(offset)
        expect(store.boxOffsets().size).toBe(0)
    })

    it("should raise the most recently dragged box to the end of the paint order", () => {
        // Arrange
        store.placeBox("/root/a", [1, 0])
        store.placeBox("/root/b", [1, 0])

        // Act
        store.placeBox("/root/a", [2, 0])
        const raised = store.raisedPaths()
        store.resetLayout()

        // Assert
        expect(raised).toEqual(["/root/b", "/root/a"])
        expect(store.raisedPaths()).toEqual([])
    })

    it("should know which box is being dragged until the drag ends", () => {
        // Arrange
        store.placeBox("/root/a", [1, 0])
        const whileDragging = store.draggingPath()

        // Act
        store.endDragging()

        // Assert
        expect(whileDragging).toBe("/root/a")
        expect(store.draggingPath()).toBeNull()
    })

    it("should open every folder holding a node to reveal it, but not the node itself", () => {
        // Arrange
        store.adoptTree(TWO_TOP_FOLDERS)

        // Act
        store.reveal("/root/src/ui/button.ts")

        // Assert
        expect([...store.expandedPaths()]).toEqual(["/root", "/root/src", "/root/src/ui"])
    })

    it("should open a folder together with the folders holding it", () => {
        // Arrange
        store.adoptTree(TWO_TOP_FOLDERS)

        // Act
        store.openFolder("/root/src/ui")

        // Assert
        expect([...store.expandedPaths()]).toEqual(["/root", "/root/src", "/root/src/ui"])
    })

    it("should open the chain box a folder is folded into", () => {
        // Arrange
        const chain = { ...leveledFolder("/root/lib/core", [leveledFolder("/root/lib/core/io")]), foldedPaths: ["/root/lib"] }
        store.adoptTree(leveledFolder("/root", [chain, leveledFolder("/root/src")]))

        // Act
        store.openFolder("/root/lib")

        // Assert
        expect(store.expandedPaths().has("/root/lib/core")).toBe(true)
    })

    it("should keep a reveal that arrives before the tree of the loaded files is adopted", () => {
        // Arrange
        store.reveal("/root/src/ui/button.ts")

        // Act
        store.adoptTree(TWO_TOP_FOLDERS)

        // Assert
        expect([...store.expandedPaths()]).toEqual(["/root", "/root/src", "/root/src/ui"])
    })

    it("should not carry a reveal made for other files over to the files adopted next", () => {
        // Arrange
        store.reveal("/root/src/ui/button.ts")
        loadLayoutIdentity(PROJECT_B)

        // Act
        store.adoptTree(TWO_TOP_FOLDERS)

        // Assert
        expect([...store.expandedPaths()]).toEqual(["/root"])
    })

    it("should not repeat a reveal made after the adoption when other files are loaded later", () => {
        // Arrange
        store.adoptTree(TWO_TOP_FOLDERS)
        store.reveal("/root/src/ui/button.ts")
        loadLayoutIdentity(PROJECT_B)

        // Act
        store.adoptTree(TWO_TOP_FOLDERS)

        // Assert
        expect([...store.expandedPaths()]).toEqual(["/root"])
    })

    it("should keep what only the graph can select and hover, and drop the selection with the graph of other files", () => {
        // Arrange
        store.adoptTree(TWO_TOP_FOLDERS)
        const selection = { kind: "box", path: "/root/a.ts/Creature", sharedPath: "/root/a.ts" } as const

        // Act
        store.selectInGraph(selection)
        store.hoverInGraph(selection.path)
        const kept = [store.graphSelection(), store.hoveredBoxPath()]
        loadLayoutIdentity(PROJECT_B)
        store.adoptTree(TWO_TOP_FOLDERS)

        // Assert
        expect(kept).toEqual([selection, selection.path])
        expect(store.graphSelection()).toBeNull()
    })
})
