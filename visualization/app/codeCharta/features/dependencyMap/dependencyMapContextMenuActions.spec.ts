import { TestBed } from "@angular/core/testing"
import { NODE_CONTEXT_MENU_VIEW_ACTIONS } from "../nodeContextMenu/facade"
import { provideDependencyMapContextMenuActions } from "./dependencyMapContextMenuActions"
import { DependencyMapViewStore } from "./stores/dependencyMapView.store"

describe("provideDependencyMapContextMenuActions", () => {
    it("should offer to hide the node from the dependency graph", () => {
        // Arrange
        TestBed.configureTestingModule({ providers: [provideDependencyMapContextMenuActions()] })
        const [hide] = TestBed.inject(NODE_CONTEXT_MENU_VIEW_ACTIONS)

        // Act
        hide.run("/root/training")

        // Assert
        expect(hide.label).toBe("Hide")
        expect([...TestBed.inject(DependencyMapViewStore).hiddenPaths()]).toEqual(["/root/training"])
    })
})
