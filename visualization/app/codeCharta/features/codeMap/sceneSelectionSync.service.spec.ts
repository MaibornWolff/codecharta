import { TestBed } from "@angular/core/testing"
import { BehaviorSubject } from "rxjs"
import { ThreeMapVisibilityStore, ThreeRendererService, ThreeSceneService } from "../../renderer/threeViewer/threeViewer.facade"
import { SharedViewReadWindow } from "../../stores/sharedView/sharedView.read.facade"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { SceneSelectionSyncService } from "./sceneSelectionSync.service"

describe("SceneSelectionSyncService", () => {
    let selectedNodePath$: BehaviorSubject<string | null>
    let keptHighlightPaths$: BehaviorSubject<string[]>
    let isMapShown$: BehaviorSubject<boolean>
    let selectedBuilding: { node: { path: string } } | null
    const threeSceneService = {
        getSelectedBuilding: jest.fn(() => selectedBuilding),
        showSelection: jest.fn((path: string | null) => {
            selectedBuilding = path === null ? null : { node: { path } }
        }),
        showKeptHighlight: jest.fn()
    }
    const threeRendererService = { render: jest.fn() }
    const codeMapMouseEventService = { drawLabelSelectedBuilding: jest.fn() }

    beforeEach(() => {
        jest.clearAllMocks()
        selectedBuilding = null
        selectedNodePath$ = new BehaviorSubject<string | null>(null)
        keptHighlightPaths$ = new BehaviorSubject<string[]>([])
        isMapShown$ = new BehaviorSubject(true)
        TestBed.configureTestingModule({
            providers: [
                { provide: SharedViewReadWindow, useValue: { selectedNodePath$, keptHighlightPaths$ } },
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
        expect(threeRendererService.render).toHaveBeenCalled()
    })

    it("should catch up with a selection made while the map was hidden once it is shown again", () => {
        // Arrange
        isMapShown$.next(false)
        selectedNodePath$.next("/root/scripts")

        // Assert — nothing was painted while the map was hidden
        expect(threeSceneService.showSelection).not.toHaveBeenCalledWith("/root/scripts")

        // Act
        isMapShown$.next(true)

        // Assert
        expect(threeSceneService.showSelection).toHaveBeenLastCalledWith("/root/scripts")
    })

    it("should keep the highlight another view kept after its selection when the map catches up", () => {
        // Arrange
        isMapShown$.next(false)
        selectedNodePath$.next("/root/scripts")
        keptHighlightPaths$.next(["/root/scripts"])

        // Act
        isMapShown$.next(true)

        // Assert
        expect(threeSceneService.showKeptHighlight).toHaveBeenLastCalledWith(["/root/scripts"])
    })

    it("should not paint again when the 3D map itself made the selection", () => {
        // Arrange — a click on a building paints the scene first, then writes the store
        selectedBuilding = { node: { path: "/root/clicked.ts" } }
        threeSceneService.showSelection.mockImplementationOnce(() => {})

        // Act
        selectedNodePath$.next("/root/clicked.ts")

        // Assert
        expect(codeMapMouseEventService.drawLabelSelectedBuilding).not.toHaveBeenCalled()
        expect(threeRendererService.render).not.toHaveBeenCalled()
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

    it("should show the highlight another view kept", () => {
        // Act
        keptHighlightPaths$.next(["/root/scripts"])

        // Assert
        expect(threeSceneService.showKeptHighlight).toHaveBeenLastCalledWith(["/root/scripts"])
    })

    it("should catch up with a highlight kept while the map was hidden once it is shown again", () => {
        // Arrange
        isMapShown$.next(false)
        keptHighlightPaths$.next(["/root/scripts"])

        // Assert — nothing was painted while the map was hidden
        expect(threeSceneService.showKeptHighlight).not.toHaveBeenCalledWith(["/root/scripts"])

        // Act
        isMapShown$.next(true)

        // Assert
        expect(threeSceneService.showKeptHighlight).toHaveBeenLastCalledWith(["/root/scripts"])
    })
})
