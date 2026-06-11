import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { CodeMapNode } from "../../../codeCharta.model"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"
import { selectedBuildingIdSelector } from "../../../state/store/appStatus/selectedBuildingId/selectedBuildingId.selector"
import { InspectorVisibilityService } from "./inspectorVisibility.service"

describe("InspectorVisibilityService", () => {
    let service: InspectorVisibilityService
    let mockStore: MockStore

    const node = { name: "invoice.ts", path: "/root/invoice.ts" } as CodeMapNode

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideMockStore({
                    selectors: [
                        { selector: selectedNodeSelector, value: undefined },
                        { selector: selectedBuildingIdSelector, value: null }
                    ]
                })
            ]
        })

        mockStore = TestBed.inject(MockStore)
        service = TestBed.inject(InspectorVisibilityService)
    })

    function selectBuilding(id: number) {
        mockStore.overrideSelector(selectedNodeSelector, node)
        mockStore.overrideSelector(selectedBuildingIdSelector, id)
        mockStore.refreshState()
    }

    function deselectBuilding() {
        mockStore.overrideSelector(selectedNodeSelector, undefined)
        mockStore.overrideSelector(selectedBuildingIdSelector, null)
        mockStore.refreshState()
    }

    it("should be hidden when no building is selected", () => {
        // Arrange, Act & Assert
        expect(service.isVisible()).toBe(false)
    })

    it("should become visible when a building is selected", () => {
        // Act
        selectBuilding(1)

        // Assert
        expect(service.isVisible()).toBe(true)
    })

    it("should hide when the building is deselected", () => {
        // Arrange
        selectBuilding(1)

        // Act
        deselectBuilding()

        // Assert
        expect(service.isVisible()).toBe(false)
    })

    it("should hide when closed manually while a building stays selected", () => {
        // Arrange
        selectBuilding(1)

        // Act
        service.close()

        // Assert
        expect(service.isVisible()).toBe(false)
    })

    it("should become visible again when a new building is selected after closing manually", () => {
        // Arrange
        selectBuilding(1)
        service.close()

        // Act
        selectBuilding(2)

        // Assert
        expect(service.isVisible()).toBe(true)
    })
})
