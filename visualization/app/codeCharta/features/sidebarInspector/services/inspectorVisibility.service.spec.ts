import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { CodeMapNode } from "../../../codeCharta.model"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"
import { ThreeRendererService } from "../../../features/codeMap/facade"
import { ThreeSceneService } from "../../../features/codeMap/facade"
import { InspectorVisibilityService } from "./inspectorVisibility.service"

describe("InspectorVisibilityService", () => {
    let service: InspectorVisibilityService
    let mockStore: MockStore
    let threeSceneService: ThreeSceneService
    let threeRendererService: ThreeRendererService

    const node = { name: "invoice.ts", path: "/root/invoice.ts" } as CodeMapNode

    beforeEach(() => {
        threeSceneService = { clearSelection: jest.fn() } as unknown as ThreeSceneService
        threeRendererService = { render: jest.fn() } as unknown as ThreeRendererService

        TestBed.configureTestingModule({
            providers: [
                provideMockStore({ selectors: [{ selector: selectedNodeSelector, value: undefined }] }),
                { provide: ThreeSceneService, useValue: threeSceneService },
                { provide: ThreeRendererService, useValue: threeRendererService }
            ]
        })

        mockStore = TestBed.inject(MockStore)
        service = TestBed.inject(InspectorVisibilityService)
    })

    function selectBuilding() {
        mockStore.overrideSelector(selectedNodeSelector, node)
        mockStore.refreshState()
    }

    function deselectBuilding() {
        mockStore.overrideSelector(selectedNodeSelector, undefined)
        mockStore.refreshState()
    }

    it("should be hidden when no building is selected", () => {
        // Arrange, Act & Assert
        expect(service.isVisible()).toBe(false)
    })

    it("should become visible when a building is selected", () => {
        // Act
        selectBuilding()

        // Assert
        expect(service.isVisible()).toBe(true)
    })

    it("should hide when the building is deselected", () => {
        // Arrange
        selectBuilding()

        // Act
        deselectBuilding()

        // Assert
        expect(service.isVisible()).toBe(false)
    })

    it("should deselect the building in the scene and re-render when closing", () => {
        // Arrange
        selectBuilding()

        // Act
        service.close()

        // Assert
        expect(threeSceneService.clearSelection).toHaveBeenCalled()
        expect(threeRendererService.render).toHaveBeenCalled()
    })
})
