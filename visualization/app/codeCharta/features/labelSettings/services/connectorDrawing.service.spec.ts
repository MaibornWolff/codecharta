import { TestBed } from "@angular/core/testing"
import { ConnectorDrawingService, LabelLayoutInfo } from "./connectorDrawing.service"
import { LabelCreationService } from "./labelCreation.service"
import { Node } from "../../../codeCharta.model"
import { Group, BoxGeometry, Mesh, Scene } from "three"
import { ThreeSceneService } from "../../../ui/codeMap/threeViewer/threeSceneService"
import { ThreeRendererService } from "../../../ui/codeMap/threeViewer/threeRenderer.service"
import { setShowMetricLabelNodeName } from "../../../state/store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.actions"
import { Store, StoreModule } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { appReducers, setStateMiddleware } from "../../../state/store/state.manager"
import { StateAccessStore } from "../stores/stateAccess.store"

describe("ConnectorDrawingService", () => {
    let store: Store<CcState>
    let stateAccessStore: StateAccessStore
    let threeSceneService: ThreeSceneService
    let threeRendererService: ThreeRendererService
    let labelCreationService: LabelCreationService
    let connectorDrawingService: ConnectorDrawingService
    let sampleLeaf: Node

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
        store = TestBed.inject(Store)
        stateAccessStore = TestBed.inject(StateAccessStore)
        threeSceneService = TestBed.inject(ThreeSceneService)
        threeRendererService = TestBed.inject(ThreeRendererService)

        threeSceneService.mapGeometry = new Group().add(new Mesh(new BoxGeometry(10, 10, 10)))
        threeSceneService.labels = new Group()
        threeSceneService.scene = new Scene()

        labelCreationService = new LabelCreationService(stateAccessStore, threeSceneService)
        connectorDrawingService = new ConnectorDrawingService(threeRendererService, threeSceneService)

        sampleLeaf = {
            name: "sample",
            path: "/root/sample",
            width: 1,
            height: 2,
            length: 3,
            depth: 4,
            x0: 5,
            z0: 6,
            y0: 7,
            isLeaf: true,
            deltas: { a: 1, b: 2 },
            attributes: { a: 20, b: 15, mcc: 99 },
            children: []
        } as undefined as Node
    })

    describe("destroy", () => {
        it("should dispose connector geometry and remove from scene", () => {
            // Arrange
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            labelCreationService.addLeafLabel(sampleLeaf, 10)
            const labels = labelCreationService.getLabels()
            const infos: LabelLayoutInfo[] = labels.map(label => ({
                label,
                rect: { top: 0, bottom: 20, left: 0, right: 100, width: 100, height: 20, x: 0, y: 0, toJSON: () => {} } as DOMRect,
                offset: 0,
                hidden: false
            }))
            connectorDrawingService.drawConnectors(infos, null)
            expect(connectorDrawingService["connectorSegments"]).not.toBeNull()

            // Act
            connectorDrawingService.destroy()

            // Assert
            expect(connectorDrawingService["connectorSegments"]).toBeNull()
            expect(connectorDrawingService["connectorPositions"]).toBeNull()
        })

        it("should be a no-op when no connectors have been created", () => {
            // Arrange
            expect(connectorDrawingService["connectorSegments"]).toBeNull()

            // Act & Assert
            expect(() => connectorDrawingService.destroy()).not.toThrow()
        })
    })

    describe("clearConnectors", () => {
        it("should set draw range to 0 when connectors exist", () => {
            // Arrange
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            labelCreationService.addLeafLabel(sampleLeaf, 10)
            const labels = labelCreationService.getLabels()
            const infos: LabelLayoutInfo[] = labels.map(label => ({
                label,
                rect: { top: 0, bottom: 20, left: 0, right: 100, width: 100, height: 20, x: 0, y: 0, toJSON: () => {} } as DOMRect,
                offset: 0,
                hidden: false
            }))
            connectorDrawingService.drawConnectors(infos, null)

            // Act
            connectorDrawingService.clearConnectors()

            // Assert
            const drawRange = connectorDrawingService["connectorSegments"].geometry.drawRange
            expect(drawRange.count).toBe(0)
        })

        it("should mark as dirty after clearing", () => {
            // Act
            connectorDrawingService.clearConnectors()

            // Assert
            expect(connectorDrawingService.isDirty()).toBe(true)
        })
    })

    describe("drawConnectors", () => {
        it("should early return when viewportH is 0", () => {
            // Arrange
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            labelCreationService.addLeafLabel(sampleLeaf, 10)
            const labels = labelCreationService.getLabels()
            const infos: LabelLayoutInfo[] = labels.map(label => ({
                label,
                rect: { top: 0, bottom: 20, left: 0, right: 100, width: 100, height: 20, x: 0, y: 0, toJSON: () => {} } as DOMRect,
                offset: 0,
                hidden: false
            }))
            // Mock labelRenderer with zero height
            Object.defineProperty(threeRendererService, "labelRenderer", {
                get: () => ({ domElement: { clientHeight: 0 } })
            })
            // Also mock window.innerHeight to 0
            const originalInnerHeight = window.innerHeight
            Object.defineProperty(window, "innerHeight", { value: 0, configurable: true })

            // Act
            connectorDrawingService.drawConnectors(infos, null)

            // Assert — connectors initialized but draw range stays at 0
            const drawRange = connectorDrawingService["connectorSegments"].geometry.drawRange
            expect(drawRange.count).toBe(0)

            // Cleanup
            Object.defineProperty(window, "innerHeight", { value: originalInnerHeight, configurable: true })
        })

        it("should populate geometry with valid infos", () => {
            // Arrange
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            labelCreationService.addLeafLabel(sampleLeaf, 10)
            const labels = labelCreationService.getLabels()
            const infos: LabelLayoutInfo[] = labels.map(label => ({
                label,
                rect: { top: 0, bottom: 20, left: 0, right: 100, width: 100, height: 20, x: 0, y: 0, toJSON: () => {} } as DOMRect,
                offset: 0,
                hidden: false
            }))

            // Act
            connectorDrawingService.drawConnectors(infos, null)

            // Assert — geometry should be initialized
            expect(connectorDrawingService["connectorSegments"]).not.toBeNull()
            expect(connectorDrawingService["connectorPositions"]).not.toBeNull()
        })
    })

    describe("isDirty / markClean", () => {
        it("should be dirty initially", () => {
            // Assert
            expect(connectorDrawingService.isDirty()).toBe(true)
        })

        it("should not be dirty after markClean", () => {
            // Act
            connectorDrawingService.markClean()

            // Assert
            expect(connectorDrawingService.isDirty()).toBe(false)
        })

        it("should be dirty again after clearConnectors", () => {
            // Arrange
            connectorDrawingService.markClean()

            // Act
            connectorDrawingService.clearConnectors()

            // Assert
            expect(connectorDrawingService.isDirty()).toBe(true)
        })
    })
})
