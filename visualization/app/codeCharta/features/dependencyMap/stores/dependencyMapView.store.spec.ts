import { TestBed } from "@angular/core/testing"
import { LeveledNode } from "../../../renderer/dependencyGraph/dependencyGraph.facade"
import { DependencyMapViewStore } from "./dependencyMapView.store"

function leveledFolder(path: string, children: LeveledNode[] = []): LeveledNode {
    return { path, name: path.split("/").pop(), level: 0, isFolder: true, children }
}

describe("DependencyMapViewStore", () => {
    let store: DependencyMapViewStore

    beforeEach(() => {
        store = TestBed.inject(DependencyMapViewStore)
    })

    it("should open a first look when it meets a tree", () => {
        // Arrange
        const tree = leveledFolder("/root", [leveledFolder("/root/app")])

        // Act
        store.adoptTree(tree)

        // Assert
        expect([...store.expandedPaths()]).toEqual(["/root", "/root/app"])
    })

    it("should keep what the reader opened while the tree keeps its root", () => {
        // Arrange
        const tree = leveledFolder("/root", [leveledFolder("/root/app")])
        store.adoptTree(tree)
        store.toggle("/root/app")

        // Act
        store.adoptTree(leveledFolder("/root", [leveledFolder("/root/app"), leveledFolder("/root/lib")]))

        // Assert
        expect(store.expandedPaths().has("/root/app")).toBe(false)
    })

    it("should start over from a first look when the tree gets a new root", () => {
        // Arrange
        store.adoptTree(leveledFolder("/root", [leveledFolder("/root/app")]))
        store.toggle("/root/app")

        // Act
        store.adoptTree(leveledFolder("/root/app", [leveledFolder("/root/app/ui")]))

        // Assert
        expect([...store.expandedPaths()]).toEqual(["/root/app", "/root/app/ui"])
    })

    it("should open a closed folder and close an open one", () => {
        // Act
        store.toggle("/root/app")
        const afterOpening = store.expandedPaths().has("/root/app")
        store.toggle("/root/app")

        // Assert
        expect(afterOpening).toBe(true)
        expect(store.expandedPaths().has("/root/app")).toBe(false)
    })

    it("should show all edges until the reader picks a filter", () => {
        // Act
        const before = store.edgeFilter()
        store.showEdges("feedback")

        // Assert
        expect(before).toBe("all")
        expect(store.edgeFilter()).toBe("feedback")
    })

    it("should keep hidden nodes while the tree keeps its root", () => {
        // Arrange
        const tree = leveledFolder("/root", [leveledFolder("/root/training")])
        store.adoptTree(tree)

        // Act
        store.hide("/root/training")
        store.adoptTree(leveledFolder("/root", [leveledFolder("/root/training"), leveledFolder("/root/app")]))

        // Assert
        expect([...store.hiddenPaths()]).toEqual(["/root/training"])
    })

    it("should show everything again when the tree gets a new root", () => {
        // Arrange
        store.adoptTree(leveledFolder("/root", [leveledFolder("/root/training")]))
        store.hide("/root/training")

        // Act
        store.adoptTree(leveledFolder("/root/app", [leveledFolder("/root/app/ui")]))

        // Assert
        expect(store.hiddenPaths().size).toBe(0)
    })

    it("should draw edges curved until the reader picks another style", () => {
        // Act
        const before = store.edgeStyle()
        store.drawEdgesAs("straight")

        // Assert
        expect(before).toBe("curved")
        expect(store.edgeStyle()).toBe("straight")
    })

    it("should keep where the reader put a box until the layout is reset", () => {
        // Act
        store.placeBox("/root/app", [20, 10])
        const placed = store.boxOffsets().get("/root/app")
        store.resetLayout()

        // Assert
        expect(placed).toEqual([20, 10])
        expect(store.boxOffsets().size).toBe(0)
    })

    it("should put every box back when the tree gets a new root", () => {
        // Arrange
        store.adoptTree(leveledFolder("/root", [leveledFolder("/root/app")]))
        store.placeBox("/root/app", [20, 10])

        // Act
        store.adoptTree(leveledFolder("/root/app", [leveledFolder("/root/app/ui")]))

        // Assert
        expect(store.boxOffsets().size).toBe(0)
    })

    it("should raise the most recently dragged box to the end of the paint order", () => {
        // Act
        store.placeBox("/root/a", [1, 0])
        store.placeBox("/root/b", [1, 0])
        store.placeBox("/root/a", [2, 0])
        const raised = store.raisedPaths()
        store.resetLayout()

        // Assert
        expect(raised).toEqual(["/root/b", "/root/a"])
        expect(store.raisedPaths()).toEqual([])
    })

    it("should know which box is being dragged until the drag ends", () => {
        // Act
        store.placeBox("/root/a", [1, 0])
        const whileDragging = store.draggingPath()
        store.endDragging()

        // Assert
        expect(whileDragging).toBe("/root/a")
        expect(store.draggingPath()).toBeNull()
    })
})
