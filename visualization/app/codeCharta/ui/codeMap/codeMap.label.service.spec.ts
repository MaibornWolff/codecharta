import "./codeMap.module"
import "../../codeCharta.module"
import { TestBed } from "@angular/core/testing"
import { CodeMapLabelService } from "./codeMap.label.service"
import { CcState, Node } from "../../codeCharta.model"
import {
    BoxGeometry,
    BufferGeometry,
    Group,
    Line,
    LineBasicMaterial,
    Mesh,
    Object3D,
    PerspectiveCamera,
    Sprite,
    SpriteMaterial,
    Vector3
} from "three"
import { ThreeCameraService } from "./threeViewer/threeCamera.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { setScaling } from "../../state/store/appSettings/scaling/scaling.actions"
import { setAmountOfTopLabels } from "../../state/store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { setHeightMetric } from "../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { setShowMetricLabelNameValue } from "../../state/store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.actions"
import { setShowMetricLabelNodeName } from "../../state/store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.actions"
import { ThreeOrbitControlsService } from "./threeViewer/threeOrbitControls.service"
import { State, Store, StoreModule } from "@ngrx/store"
import { appReducers, setStateMiddleware } from "../../state/store/state.manager"

describe("CodeMapLabelService", () => {
    let state: State<CcState>
    let store: Store<CcState>
    let threeCameraService: ThreeCameraService
    let threeSceneService: ThreeSceneService
    let codeMapLabelService: CodeMapLabelService
    let threeOrbitControlsService: ThreeOrbitControlsService
    let createElementOrigin
    let sampleLeaf: Node
    let otherSampleLeaf: Node
    let canvasContextMock
    let sampleLeafDelta: Node

    beforeEach(() => {
        restartSystem()
        rebuild()
        withMockedThreeCameraService()
        withMockedThreeSceneService()
        setCanvasRenderSettings()
    })

    function restartSystem() {
        TestBed.configureTestingModule({
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
        store = TestBed.inject(Store)

        state = TestBed.inject(State)
        threeCameraService = TestBed.inject(ThreeCameraService)
        threeSceneService = TestBed.inject(ThreeSceneService)
        threeOrbitControlsService = TestBed.inject(ThreeOrbitControlsService)
    }

    function rebuild() {
        codeMapLabelService = new CodeMapLabelService(state, threeCameraService, threeSceneService, threeOrbitControlsService)
    }

    function withMockedThreeCameraService() {
        threeCameraService.camera = new PerspectiveCamera()
        threeCameraService.camera.position.distanceTo = jest.fn()
    }

    function withMockedThreeSceneService() {
        threeSceneService.mapGeometry = new Group().add(new Mesh(new BoxGeometry(10, 10, 10)))
        threeSceneService.labels.add = jest.fn()
        threeSceneService.labels.children = []
    }

    function setCanvasRenderSettings() {
        sampleLeaf = {
            name: "sample",
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

        sampleLeafDelta = {
            name: "otherSampleLeaf",
            width: 4,
            height: 7,
            length: 2,
            depth: 1,
            x0: 5,
            z0: 6,
            y0: 7,
            isLeaf: true,
            deltas: { a: 1, b: 2 },
            attributes: { a: 20, b: 15, mcc: 99 },
            heightDelta: 8,
            children: []
        } as undefined as Node

        canvasContextMock = {
            font: "",
            measureText: jest.fn(),
            fillText: jest.fn(),
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            arcTo: jest.fn(),
            closePath: jest.fn(),
            fill: jest.fn()
        }

        createElementOrigin = document.createElement

        document.createElement = jest.fn().mockReturnValue({
            getContext: () => {
                return canvasContextMock
            }
        })

        canvasContextMock.measureText.mockReturnValue({ width: 10 })
    }

    afterEach(() => {
        document.createElement = createElementOrigin
    })

    describe("constructor", () => {
        it("should not have any labels", () => {
            expect(codeMapLabelService["labels"].length).toBe(0)
        })
    })

    describe("addLeafLabel", () => {
        beforeEach(() => {
            store.dispatch(setAmountOfTopLabels({ value: 1 }))
            store.dispatch(setHeightMetric({ value: "mcc" }))
            codeMapLabelService["nodeHeight"] = 0
        })

        it("should add label if node has a height attribute mentioned in renderSettings", () => {
            store.dispatch(setShowMetricLabelNameValue({ value: true }))
            store.dispatch(setShowMetricLabelNodeName({ value: true }))

            codeMapLabelService.addLeafLabel(sampleLeaf, 0)

            expect(codeMapLabelService["labels"].length).toBe(1)
        })

        it("should add label even if node has a height of value 0", () => {
            sampleLeaf.attributes = { mcc: 0 }

            store.dispatch(setShowMetricLabelNameValue({ value: true }))
            store.dispatch(setShowMetricLabelNodeName({ value: true }))

            codeMapLabelService.addLeafLabel(sampleLeaf, 0)

            expect(codeMapLabelService["labels"].length).toBe(1)
        })

        it("should calculate correct height without delta with node name only", () => {
            store.dispatch(setShowMetricLabelNameValue({ value: false }))
            store.dispatch(setShowMetricLabelNodeName({ value: true }))

            codeMapLabelService.addLeafLabel(sampleLeaf, 0)

            const positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
            expect(positionWithoutDelta.y).toBe(166.75)
        })

        it("should calculate correct height without delta with metric values only", () => {
            store.dispatch(setShowMetricLabelNameValue({ value: false }))
            store.dispatch(setShowMetricLabelNodeName({ value: true }))

            codeMapLabelService.addLeafLabel(sampleLeaf, 0)

            const positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
            expect(positionWithoutDelta.y).toBe(166.75)
        })

        it("should use node height value if nodeHeight is greater than the nodes height ", () => {
            store.dispatch(setShowMetricLabelNameValue({ value: false }))
            store.dispatch(setShowMetricLabelNodeName({ value: true }))
            codeMapLabelService["nodeHeight"] = 100

            store.dispatch(setShowMetricLabelNameValue({ value: false }))
            store.dispatch(setShowMetricLabelNodeName({ value: true }))

            codeMapLabelService.addLeafLabel(sampleLeaf, 0)

            const positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
            expect(positionWithoutDelta.y).toBe(264.75)
        })

        it("should use the nodes actual height if its greater then nodeHeight", () => {
            codeMapLabelService["nodeHeight"] = 10

            store.dispatch(setShowMetricLabelNameValue({ value: false }))
            store.dispatch(setShowMetricLabelNodeName({ value: true }))

            codeMapLabelService.addLeafLabel(sampleLeaf, 0)

            const positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
            expect(positionWithoutDelta.y).toBe(174.75)
        })

        it("should calculate correct height without delta for two line label: node name and metric value", () => {
            store.dispatch(setShowMetricLabelNameValue({ value: true }))
            store.dispatch(setShowMetricLabelNodeName({ value: true }))

            codeMapLabelService.addLeafLabel(sampleLeaf, 0)

            const positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
            expect(positionWithoutDelta.y).toBe(181.75)
        })

        it("should use the nodes actual height if its greater then nodeHeight and update nodeHeight correctly", () => {
            store.dispatch(setShowMetricLabelNameValue({ value: false }))
            store.dispatch(setShowMetricLabelNodeName({ value: true }))

            codeMapLabelService.addLeafLabel(sampleLeafDelta, 0)

            const positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
            expect(positionWithoutDelta.y).toBe(179.75)
            expect(codeMapLabelService["nodeHeight"]).toEqual(15)
        })

        it("should use highestNodeInSet if its greater then nodes actual height and nodeHeight and should update nodeHeight correctly", () => {
            store.dispatch(setShowMetricLabelNameValue({ value: false }))
            store.dispatch(setShowMetricLabelNodeName({ value: true }))

            codeMapLabelService.addLeafLabel(sampleLeafDelta, 20)

            const positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
            expect(positionWithoutDelta.y).toBe(184.75)
            expect(codeMapLabelService["nodeHeight"]).toEqual(20)
        })

        it("should use the updated and stored value for nodeHeight when adding a new, smaller node", () => {
            codeMapLabelService["nodeHeight"] = 10

            store.dispatch(setShowMetricLabelNameValue({ value: false }))
            store.dispatch(setShowMetricLabelNodeName({ value: true }))

            codeMapLabelService.addLeafLabel(sampleLeafDelta, 0)

            const positionSampleDeltaLeaf: Vector3 = codeMapLabelService["labels"][0].sprite.position
            expect(positionSampleDeltaLeaf.y).toBe(179.75)

            store.dispatch(setShowMetricLabelNameValue({ value: false }))
            store.dispatch(setShowMetricLabelNodeName({ value: true }))

            codeMapLabelService.addLeafLabel(sampleLeaf, 0)
            const positionSampleLeafWithAppliedDeltaNodeHeight: Vector3 = codeMapLabelService["labels"][0].sprite.position
            expect(positionSampleLeafWithAppliedDeltaNodeHeight.y).toBe(179.75)
        })

        it("should set the text correctly, creating a two line label", () => {
            store.dispatch(setShowMetricLabelNameValue({ value: true }))
            store.dispatch(setShowMetricLabelNodeName({ value: true }))

            codeMapLabelService.addLeafLabel(sampleLeaf, 0)

            const lineCount = codeMapLabelService["labels"][0].lineCount
            expect(lineCount).toBe(2)
        })

        it("should set the text correctly, creating a one line label", () => {
            store.dispatch(setShowMetricLabelNameValue({ value: false }))
            store.dispatch(setShowMetricLabelNodeName({ value: true }))

            codeMapLabelService.addLeafLabel(sampleLeaf, 0)

            const lineCount = codeMapLabelService["labels"][0].lineCount
            expect(lineCount).toBe(1)
        })

        it("scaling existing labels multiple times should scale their position correctly", () => {
            const SX = 1
            const SY = 2
            const SZ = 3

            store.dispatch(setShowMetricLabelNameValue({ value: true }))
            store.dispatch(setShowMetricLabelNodeName({ value: true }))

            codeMapLabelService.addLeafLabel(sampleLeaf, 0)
            codeMapLabelService.addLeafLabel(sampleLeaf, 0)

            const originalSpritePositionsA = codeMapLabelService["labels"][0].sprite.position.clone()

            const lineGeometry = codeMapLabelService["labels"][0].line.geometry as BufferGeometry

            const originalLineGeometryStartVertices = lineGeometry.attributes.position.clone()

            const scaledLabelA = codeMapLabelService["labels"][0]
            const scaledLabelB = codeMapLabelService["labels"][1]

            store.dispatch(setScaling({ value: new Vector3(SX, SY, SZ) }))

            const expectedScaledSpritePositions = new Vector3(originalSpritePositionsA.x * SX, 232.25, originalSpritePositionsA.z * SZ)

            const expectedScaledLineGeometryStart = new Vector3(
                originalLineGeometryStartVertices.getX(0) * SX,
                originalLineGeometryStartVertices.getY(0),
                originalLineGeometryStartVertices.getZ(0) * SZ
            )

            codeMapLabelService.scale()

            assertLabelPositions(scaledLabelA, expectedScaledSpritePositions, expectedScaledLineGeometryStart)
            assertLabelPositions(scaledLabelB, expectedScaledSpritePositions, expectedScaledLineGeometryStart)

            codeMapLabelService.scale()

            // Ensure that scaling factors are not additive
            assertLabelPositions(scaledLabelA, expectedScaledSpritePositions, expectedScaledLineGeometryStart)
            assertLabelPositions(scaledLabelB, expectedScaledSpritePositions, expectedScaledLineGeometryStart)
        })

        it("scaling labels from a factor bigger to factor smaller then 1.0 should scale positions correctly", () => {
            store.dispatch(setShowMetricLabelNameValue({ value: false }))
            store.dispatch(setShowMetricLabelNodeName({ value: true }))

            codeMapLabelService.addLeafLabel(sampleLeaf, 0)
            codeMapLabelService.addLeafLabel(sampleLeaf, 0)

            store.dispatch(setScaling({ value: new Vector3(1, 2, 1) }))
            codeMapLabelService.scale()

            const positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
            expect(positionWithoutDelta.y).toBe(202.25)

            store.dispatch(setScaling({ value: new Vector3(1, 0.5, 1) }))
            codeMapLabelService.scale()

            expect(positionWithoutDelta.y).toBe(149)
        })

        it("scaling labels from a factor smaller to factor bigger then 1.0 should scale positions correctly", () => {
            store.dispatch(setShowMetricLabelNameValue({ value: false }))
            store.dispatch(setShowMetricLabelNodeName({ value: true }))

            codeMapLabelService.addLeafLabel(sampleLeaf, 0)
            codeMapLabelService.addLeafLabel(sampleLeaf, 0)

            store.dispatch(setScaling({ value: new Vector3(1, 0.5, 1) }))
            codeMapLabelService.scale()

            const positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
            expect(positionWithoutDelta.y).toBe(149)

            store.dispatch(setScaling({ value: new Vector3(1, 2, 1) }))
            codeMapLabelService.scale()

            expect(positionWithoutDelta.y).toBe(202.25)
        })

        it("should apply scaling factor to a newly created label", () => {
            store.dispatch(setScaling({ value: new Vector3(1, 2, 1) }))

            store.dispatch(setShowMetricLabelNameValue({ value: false }))
            store.dispatch(setShowMetricLabelNodeName({ value: true }))

            codeMapLabelService.addLeafLabel(sampleLeaf, 0)

            const positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
            expect(positionWithoutDelta.y).toBe(174.75)
        })

        function assertLabelPositions(scaledLabel, expectedSpritePositions: Vector3, expectedScaledLineGeometryStart: Vector3) {
            expect(scaledLabel.sprite.position.x).toBe(expectedSpritePositions.x)
            expect(scaledLabel.sprite.position.y).toBeCloseTo(expectedSpritePositions.y, 3)
            expect(scaledLabel.sprite.position.z).toBe(expectedSpritePositions.z)

            const lineGeometry = scaledLabel.line.geometry as BufferGeometry
            const scaledLabelPos = lineGeometry.attributes.position

            expect(scaledLabelPos.getX(0)).toBe(expectedScaledLineGeometryStart.x)
            expect(scaledLabelPos.getY(0)).toBe(expectedScaledLineGeometryStart.y)

            expect(scaledLabelPos.getX(1)).toBe(expectedSpritePositions.x)
            expect(scaledLabelPos.getY(1)).toBeCloseTo(expectedSpritePositions.y, 3)
            expect(scaledLabelPos.getZ(1)).toBe(expectedSpritePositions.z)
        }
    })

    describe("clearTemporaryLabel", () => {
        const generateSceneLabelChild = (numberOfChildren: number): Object3D[] => {
            const generated = []
            for (let index = 0; index < numberOfChildren; index++) {
                generated[index] = { line: undefined, sprite: undefined } as unknown as Object3D
            }
            return generated
        }
        it("should clear label for the correct node only", () => {
            store.dispatch(setAmountOfTopLabels({ value: 2 }))
            store.dispatch(setHeightMetric({ value: "mcc" }))
            codeMapLabelService.dispose = jest.fn()

            store.dispatch(setShowMetricLabelNameValue({ value: false }))
            store.dispatch(setShowMetricLabelNodeName({ value: true }))

            codeMapLabelService.addLeafLabel(sampleLeaf, 0)
            codeMapLabelService.addLeafLabel(otherSampleLeaf, 0)

            threeSceneService.labels.children = generateSceneLabelChild(4)

            threeSceneService["highlightedLineIndex"] = 5
            threeSceneService["highlightedLine"] = new Object3D()
            codeMapLabelService.clearTemporaryLabel(sampleLeaf)

            expect(codeMapLabelService.dispose).toBeCalledWith(threeSceneService.labels.children)
            expect(threeSceneService.labels.children.length).toEqual(2)
            expect(codeMapLabelService["labels"][0].node).toEqual(otherSampleLeaf)
            expect(threeSceneService["highlightedLineIndex"]).toEqual(-1)
            expect(threeSceneService["highlightedLine"]).toEqual(null)
        })

        it("should not clear if no label exists for a given node", () => {
            store.dispatch(setAmountOfTopLabels({ value: 2 }))
            store.dispatch(setHeightMetric({ value: "mcc" }))

            store.dispatch(setShowMetricLabelNameValue({ value: false }))
            store.dispatch(setShowMetricLabelNodeName({ value: true }))

            codeMapLabelService.addLeafLabel(sampleLeaf, 0)
            threeSceneService.labels.children.length = 2

            codeMapLabelService.clearTemporaryLabel(otherSampleLeaf)

            expect(threeSceneService.labels.children.length).toEqual(2)
            expect(codeMapLabelService["labels"][0].node).toEqual(sampleLeaf)
        })
    })

    describe("clearLabels", () => {
        it("should clear parent in scene and internal labels", () => {
            codeMapLabelService.clearLabels()

            expect(codeMapLabelService["threeSceneService"].labels.children.length).toBe(0)
            expect(codeMapLabelService["labels"].length).toBe(0)
        })
    })

    const MockedSprite = () => {
        const sprite = new Sprite()
        sprite.material = {
            map: { dispose: jest.fn() },
            dispose: jest.fn()
        } as unknown as SpriteMaterial
        sprite.geometry = { dispose: jest.fn() } as unknown as BufferGeometry
        return sprite
    }

    const MockedLine = () => {
        const line = new Line()
        line.material = {
            dispose: jest.fn()
        } as unknown as LineBasicMaterial
        line.geometry = { dispose: jest.fn() } as unknown as BufferGeometry
        return line
    }

    const MockedInternalLabel = () => {
        return {
            sprite: MockedSprite(),
            line: MockedLine()
        }
    }

    describe("disposeSprite", () => {
        let sprite

        beforeEach(() => {
            sprite = MockedSprite()
        })
        it("should dispose material", () => {
            codeMapLabelService["disposeSprite"](sprite)

            expect(sprite.material.dispose).toBeCalled()
        })

        it("should dispose material map texture", () => {
            codeMapLabelService["disposeSprite"](sprite)

            expect(sprite.material.map.dispose).toBeCalled()
        })

        it("should dispose sprite geometry", () => {
            codeMapLabelService["disposeSprite"](sprite)

            expect(sprite.geometry.dispose).toBeCalled()
        })
    })

    describe("disposeLine", () => {
        let line
        beforeEach(() => {
            line = MockedLine()
        })

        it("should dispose material", () => {
            codeMapLabelService["disposeLine"](line)

            expect(line.material.dispose).toBeCalled()
        })

        it("should dispose geometry", () => {
            codeMapLabelService["disposeLine"](line)

            expect(line.geometry.dispose).toBeCalled()
        })
    })

    describe("dispose", () => {
        beforeEach(() => {
            codeMapLabelService["disposeSprite"] = jest.fn()
            codeMapLabelService["disposeLine"] = jest.fn()
        })
        it("should call disposeSprite two times", () => {
            const spriteElement = MockedSprite()

            codeMapLabelService.dispose([spriteElement, spriteElement])

            expect(codeMapLabelService["disposeSprite"]).toBeCalledTimes(2)
        })

        it("should call disposeLine two times", () => {
            const lineElement = MockedLine()

            codeMapLabelService.dispose([lineElement, lineElement])

            expect(codeMapLabelService["disposeLine"]).toBeCalledTimes(2)
        })

        it("should call disposeSprite two times when InternalLabel[] is set", () => {
            const internalLabel = MockedInternalLabel()

            codeMapLabelService.dispose([internalLabel, internalLabel])

            expect(codeMapLabelService["disposeSprite"]).toBeCalledTimes(2)
        })

        it("should call disposeLine two times when InternalLabel[] is set", () => {
            const internalLabel = MockedInternalLabel()

            codeMapLabelService.dispose([internalLabel, internalLabel])

            expect(codeMapLabelService["disposeLine"]).toBeCalledTimes(2)
        })
    })
})
