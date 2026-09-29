import { TestBed } from "@angular/core/testing"
import { NODE_CONTEXT_MENU_VIEW_ACTIONS } from "../nodeContextMenu/facade"
import { provideDependencyMapContextMenuActions } from "./dependencyMapContextMenuActions"
import { DependencyMapViewStore } from "./stores/dependencyMapView.store"

describe("provideDependencyMapContextMenuActions", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideDependencyMapContextMenuActions()] })
    })

    it("should offer to hide a shown node from the dependency graph", () => {
        // Arrange
        const [hide] = TestBed.inject(NODE_CONTEXT_MENU_VIEW_ACTIONS)

        // Act
        const isOffered = hide.isOfferedFor("/root/training")
        hide.run("/root/training")

        // Assert
        expect(hide.label).toBe("Hide")
        expect(isOffered).toBe(true)
        expect([...TestBed.inject(DependencyMapViewStore).hiddenPaths()]).toEqual(["/root/training"])
    })

    it("should offer to show a hidden node again instead of hiding it", () => {
        // Arrange
        const [hide, showAgain] = TestBed.inject(NODE_CONTEXT_MENU_VIEW_ACTIONS)
        hide.run("/root/training")

        // Act
        const offered = [hide, showAgain].map(action => action.isOfferedFor("/root/training/a.ts"))
        showAgain.run("/root/training/a.ts")

        // Assert
        expect(offered).toEqual([false, true])
        expect(TestBed.inject(DependencyMapViewStore).hiddenPaths().size).toBe(0)
    })
})
