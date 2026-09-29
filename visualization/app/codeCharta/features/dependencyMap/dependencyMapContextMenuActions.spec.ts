import { TestBed } from "@angular/core/testing"
import { NODE_CONTEXT_MENU_VIEW_ACTIONS } from "../nodeContextMenu/facade"
import { provideDependencyMapContextMenuActions } from "./dependencyMapContextMenuActions"
import { DependencyMapWriteStore } from "./stores/dependencyMap.write.store"

describe("provideDependencyMapContextMenuActions", () => {
    it("should offer to exclude a node from the map", () => {
        // Arrange
        const writeStore = { excludeNode: jest.fn() }
        TestBed.configureTestingModule({
            providers: [provideDependencyMapContextMenuActions(), { provide: DependencyMapWriteStore, useValue: writeStore }]
        })
        const [exclude] = TestBed.inject(NODE_CONTEXT_MENU_VIEW_ACTIONS)

        // Act
        exclude.run("/root/training")

        // Assert
        expect(exclude.label).toBe("Exclude")
        expect(writeStore.excludeNode).toHaveBeenCalledWith("/root/training")
    })
})
