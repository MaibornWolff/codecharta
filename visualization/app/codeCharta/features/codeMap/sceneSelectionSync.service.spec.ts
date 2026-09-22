import { TestBed } from "@angular/core/testing"
import { BehaviorSubject } from "rxjs"
import { ThreeMapVisibilityStore, ThreeRendererService, ThreeSceneService } from "../../renderer/threeViewer/threeViewer.facade"
import { SharedViewReadWindow } from "../../stores/sharedView/sharedView.read.facade"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { SceneSelectionSyncService } from "./sceneSelectionSync.service"

describe("SceneSelectionSyncService", () => {
    let selectedNodePath$: BehaviorSubject<string | null>
    let isMapShown$: BehaviorSubject<boolean>
    let selectedBuilding: { node: { path: string } } | null
    const threeSceneService = {
        getSelectedBuilding: jest.fn(() => selectedBuilding),
        showSelection: jest.fn((path: string | null) => {
            selectedBuilding = path === null ? null : { node: { path } }
        }),
        clearConstantHighlight: jest.fn()
    }
    const threeRendererService = { render: jest.fn() }
    const codeMapMouseEventService = { drawLabelSelectedBuilding: jest.fn() }

    beforeEach(() => {
        jest.clearAllMocks()
        selectedBuilding = null
        selectedNodePath$ = new BehaviorSubject<string | null>(null)
        isMapShown$ = new BehaviorSubject(true)
        TestBed.configureTestingModule({
            providers: [
                { provide: SharedViewReadWindow, useValue: { selectedNodePath$ } },
                { provide: ThreeMapVisibilityStore, useValue: { isMapShown$ } },
                { provide: ThreeSceneService, useValue: threeSceneService },
                { provide: ThreeRendererService, useValue: threeRendererService },
                { provide: CodeMapMouseEventService, useValue: codeMapMouseEventService }
            ]
        })
        TestBed.inject(SceneSelectionSyncService).start()
    })

    it("should show on the map what another view selected, with its label, and redraw", () => {
        // Act
        selectedNodePath$.next("/root/scripts")

        // Assert
        expect(threeSceneService.showSelection).toHaveBeenLastCalledWith("/root/scripts")
        expect(codeMapMouseEventService.drawLabelSelectedBuilding).toHaveBeenCalledWith({ node: { path: "/root/scripts" } })
        expect(threeSceneService.clearConstantHighlight).toHaveBeenCalled()
        expect(threeRendererService.render).toHaveBeenCalled()
    })

    it("should catch up with a selection made while the map was hidden once it is shown again", () => {
        // Arrange
        isMapShown$.next(false)
        selectedNodePath$.next("/root/scripts")
        const callsWhileHidden = threeSceneService.showSelection.mock.calls.length

        // Act
        isMapShown$.next(true)

        // Assert
        expect(callsWhileHidden).toBe(1)
        expect(threeSceneService.showSelection).toHaveBeenLastCalledWith("/root/scripts")
    })

    it("should not redraw when the map already shows the selection", () => {
        // Arrange
        selectedBuilding = { node: { path: "/root/scripts" } }
        threeSceneService.showSelection.mockImplementationOnce(() => {})

        // Act
        selectedNodePath$.next("/root/scripts")

        // Assert
        expect(threeRendererService.render).not.toHaveBeenCalled()
    })
})
