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
})
