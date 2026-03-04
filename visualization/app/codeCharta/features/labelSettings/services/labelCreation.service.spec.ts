import { TestBed } from "@angular/core/testing"
import { LabelCreationService } from "./labelCreation.service"
import { CcState, Node } from "../../../codeCharta.model"
import { Group, BoxGeometry, Mesh } from "three"
import { ThreeSceneService } from "../../../ui/codeMap/threeViewer/threeSceneService"
import { StateAccessStore } from "../stores/stateAccess.store"
import { setAmountOfTopLabels } from "../../../state/store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { setHeightMetric } from "../../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { setShowMetricLabelNameValue } from "../../../state/store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.actions"
import { setShowMetricLabelNodeName } from "../../../state/store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.actions"
import { Store, StoreModule } from "@ngrx/store"
import { appReducers, setStateMiddleware } from "../../../state/store/state.manager"

describe("LabelCreationService", () => {
    let store: Store<CcState>
    let stateAccessStore: StateAccessStore
    let threeSceneService: ThreeSceneService
    let labelCreationService: LabelCreationService
    let sampleLeaf: Node
    let otherSampleLeaf: Node

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
        store = TestBed.inject(Store)
        stateAccessStore = TestBed.inject(StateAccessStore)
        threeSceneService = TestBed.inject(ThreeSceneService)

        labelCreationService = new LabelCreationService(stateAccessStore, threeSceneService)

        threeSceneService.mapGeometry = new Group().add(new Mesh(new BoxGeometry(10, 10, 10)))
        threeSceneService.labels = new Group()

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

        otherSampleLeaf = {
            name: "otherSampleLeaf",
            path: "/root/otherSampleLeaf",
            width: 4,
            height: 3,
            length: 2,
            depth: 1,
            x0: 5,
            z0: 6,
            y0: 7,
            isLeaf: true,
            deltas: { a: 1, b: 2 },
            attributes: { a: 20, b: 15, mcc: 99 },
            children: []
        } as undefined as Node
    })

    describe("getLabels", () => {
        it("should return empty array initially", () => {
            expect(labelCreationService.getLabels().length).toBe(0)
        })
    })

    describe("addLeafLabel", () => {
        beforeEach(() => {
            store.dispatch(setAmountOfTopLabels({ value: 1 }))
            store.dispatch(setHeightMetric({ value: "mcc" }))
        })

        it("should add a CSS2DObject label to the scene", () => {
            // Arrange
            store.dispatch(setShowMetricLabelNameValue({ value: true }))
            store.dispatch(setShowMetricLabelNodeName({ value: true }))

            // Act
            labelCreationService.addLeafLabel(sampleLeaf, 0)

            // Assert
            expect(labelCreationService.getLabels().length).toBe(1)
            expect(threeSceneService.labels.children.length).toBe(1)
        })

        it("should not add label if both show options are false and enforceLabel is false", () => {
            // Arrange
            store.dispatch(setShowMetricLabelNameValue({ value: false }))
            store.dispatch(setShowMetricLabelNodeName({ value: false }))

            // Act
            labelCreationService.addLeafLabel(sampleLeaf, 0)

            // Assert
            expect(labelCreationService.getLabels().length).toBe(0)
        })

        it("should add label with enforceLabel even when show options are false", () => {
            // Arrange
            store.dispatch(setShowMetricLabelNameValue({ value: false }))
            store.dispatch(setShowMetricLabelNodeName({ value: false }))

            // Act
            labelCreationService.addLeafLabel(sampleLeaf, 0, true)

            // Assert
            expect(labelCreationService.getLabels().length).toBe(1)
        })

        it("should store node reference in userData", () => {
            // Arrange
            store.dispatch(setShowMetricLabelNodeName({ value: true }))

            // Act
            labelCreationService.addLeafLabel(sampleLeaf, 0)

            // Assert
            const cssObject = labelCreationService.getLabels()[0].labelElement.cssObject
            expect(cssObject.userData.node).toBe(sampleLeaf)
        })

        it("should create wrapper with content child", () => {
            // Arrange
            store.dispatch(setShowMetricLabelNodeName({ value: true }))

            // Act
            labelCreationService.addLeafLabel(sampleLeaf, 0)

            // Assert
            const content = labelCreationService.getLabels()[0].labelElement.getContentElement()
            expect(content).toBeTruthy()
            expect(content.textContent).toContain("sample")
        })
    })

    describe("clearLabels", () => {
        it("should clear all labels from scene and internal list", () => {
            // Arrange
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            labelCreationService.addLeafLabel(sampleLeaf, 0)
            labelCreationService.addLeafLabel(otherSampleLeaf, 0)
            expect(labelCreationService.getLabels().length).toBe(2)

            // Act
            labelCreationService.clearLabels()

            // Assert
            expect(labelCreationService.getLabels().length).toBe(0)
            expect(threeSceneService.labels.children.length).toBe(0)
        })
    })

    describe("clearTemporaryLabel", () => {
        it("should clear label for the correct node only", () => {
            // Arrange
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            labelCreationService.addLeafLabel(sampleLeaf, 0)
            labelCreationService.addLeafLabel(otherSampleLeaf, 0)
            expect(labelCreationService.getLabels().length).toBe(2)

            // Act
            labelCreationService.clearTemporaryLabel(sampleLeaf)

            // Assert
            expect(labelCreationService.getLabels().length).toBe(1)
            expect(labelCreationService.getLabels()[0].node).toEqual(otherSampleLeaf)
        })

        it("should not clear if no label exists for a given node", () => {
            // Arrange
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            labelCreationService.addLeafLabel(sampleLeaf, 0)

            // Act
            labelCreationService.clearTemporaryLabel(otherSampleLeaf)

            // Assert
            expect(labelCreationService.getLabels().length).toBe(1)
            expect(labelCreationService.getLabels()[0].node).toEqual(sampleLeaf)
        })
    })

    describe("hasLabelForNode", () => {
        it("should return true if label exists for node", () => {
            // Arrange
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            labelCreationService.addLeafLabel(sampleLeaf, 0)

            // Act & Assert
            expect(labelCreationService.hasLabelForNode(sampleLeaf)).toBe(true)
        })

        it("should return false if no label exists for node", () => {
            // Act & Assert
            expect(labelCreationService.hasLabelForNode(sampleLeaf)).toBe(false)
        })
    })

    describe("suppressLabelForNode", () => {
        it("should set opacity to 0 for the matching label", () => {
            // Arrange
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            labelCreationService.addLeafLabel(sampleLeaf, 0)

            // Act
            labelCreationService.suppressLabelForNode(sampleLeaf)

            // Assert
            const content = labelCreationService.getLabels()[0].labelElement.getContentElement()
            expect(content.style.opacity).toBe("0")
            expect(labelCreationService.getSuppressedLabel()).toBe(labelCreationService.getLabels()[0])
        })

        it("should not suppress if node has no label", () => {
            // Act
            labelCreationService.suppressLabelForNode(sampleLeaf)

            // Assert
            expect(labelCreationService.getSuppressedLabel()).toBeNull()
        })
    })

    describe("restoreSuppressedLabel", () => {
        it("should restore opacity to 1 for the suppressed label", () => {
            // Arrange
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            labelCreationService.addLeafLabel(sampleLeaf, 0)

            // Act
            labelCreationService.suppressLabelForNode(sampleLeaf)
            labelCreationService.restoreSuppressedLabel()

            // Assert
            const content = labelCreationService.getLabels()[0].labelElement.getContentElement()
            expect(content.style.opacity).toBe("1")
            expect(labelCreationService.getSuppressedLabel()).toBeNull()
        })

        it("should be a no-op if nothing is suppressed", () => {
            // Act & Assert
            expect(() => labelCreationService.restoreSuppressedLabel()).not.toThrow()
        })
    })
})
