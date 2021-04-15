import "./codeMap.module"
import "../../codeCharta.module"
import { CodeMapLabelService } from "./codeMap.label.service"
import { Node } from "../../codeCharta.model"
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
import { ThreeCameraService } from "./threeViewer/threeCameraService"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { withMockedEventMethods } from "../../util/dataMocks"
import { StoreService } from "../../state/store.service"
import { setScaling } from "../../state/store/appSettings/scaling/scaling.actions"
import { setAmountOfTopLabels } from "../../state/store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { setHeightMetric } from "../../state/store/dynamicSettings/heightMetric/heightMetric.actions"

describe("CodeMapLabelService", () => {
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let threeCameraService: ThreeCameraService
	let threeSceneService: ThreeSceneService
	let codeMapLabelService: CodeMapLabelService
	let createElementOrigin
	let sampleLeaf: Node
	let otherSampleLeaf: Node
	let canvasContextMock
	let sampleLeafDelta: Node

	beforeEach(() => {
		restartSystem()
		rebuild()
		withMockedEventMethods($rootScope)
		withMockedThreeCameraService()
		withMockedThreeSceneService()
		setCanvasRenderSettings()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		threeCameraService = getService<ThreeCameraService>("threeCameraService")
		threeSceneService = getService<ThreeSceneService>("threeSceneService")
	}

	function rebuild() {
		codeMapLabelService = new CodeMapLabelService($rootScope, storeService, threeCameraService, threeSceneService)
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
		sampleLeaf = ({
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
		} as undefined) as Node

		otherSampleLeaf = ({
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
		} as undefined) as Node

		sampleLeafDelta = ({
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
		} as undefined) as Node

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

	describe("addLabel", () => {
		beforeEach(() => {
			storeService.dispatch(setAmountOfTopLabels(1))
			storeService.dispatch(setHeightMetric("mcc"))
			codeMapLabelService["nodeHeight"] = 0
		})

		it("should add label if node has a height attribute mentioned in renderSettings", () => {
			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: true })

			expect(codeMapLabelService["labels"].length).toBe(1)
		})

		it("should add label even if node has a height of value 0", () => {
			sampleLeaf.attributes = { mcc: 0 }

			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: true })

			expect(codeMapLabelService["labels"].length).toBe(1)
		})

		it("should calculate correct height without delta with node name only", () => {
			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: false })

			const positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
			expect(positionWithoutDelta.y).toBe(33)
		})

		it("should calculate correct height without delta with metric values only", () => {
			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: false })

			const positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
			expect(positionWithoutDelta.y).toBe(33)
		})

		it("should use node height value if nodeHeight is greater than the nodes height ", () => {
			codeMapLabelService["nodeHeight"] = 100
			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: false })

			const positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
			expect(positionWithoutDelta.y).toBe(131)
		})

		it("should use the nodes actual height if its greater then nodeHeight", () => {
			codeMapLabelService["nodeHeight"] = 10
			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: false })

			const positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
			expect(positionWithoutDelta.y).toBe(41)
		})

		it("should calculate correct height without delta for two line label: node name and metric value", () => {
			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: true })

			const positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
			expect(positionWithoutDelta.y).toBe(48)
		})

		it("should use the nodes actual height if its greater then nodeHeight and update nodeHeight correctly", () => {
			codeMapLabelService.addLabel(sampleLeafDelta, { showNodeName: true, showNodeMetric: false })

			const positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
			expect(positionWithoutDelta.y).toBe(46)
			expect(codeMapLabelService["nodeHeight"]).toEqual(15)
		})

		it("should use the updated and stored value for nodeHeight when adding a new, smaller node", () => {
			codeMapLabelService["nodeHeight"] = 10
			codeMapLabelService.addLabel(sampleLeafDelta, { showNodeName: true, showNodeMetric: false })

			const positionSampleDeltaLeaf: Vector3 = codeMapLabelService["labels"][0].sprite.position
			expect(positionSampleDeltaLeaf.y).toBe(46)

			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: false })
			const positionSampleLeafWithAppliedDeltaNodeHeight: Vector3 = codeMapLabelService["labels"][0].sprite.position
			expect(positionSampleLeafWithAppliedDeltaNodeHeight.y).toBe(46)
		})

		it("should set the text correctly, creating a two line label", () => {
			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: true })

			const lineCount = codeMapLabelService["labels"][0].lineCount
			expect(lineCount).toBe(2)
		})

		it("should set the text correctly, creating a one line label", () => {
			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: false })

			const lineCount = codeMapLabelService["labels"][0].lineCount
			expect(lineCount).toBe(1)
		})

		it("scaling existing labels multiple times should scale their position correctly", () => {
			const { margin } = storeService.getState().dynamicSettings
			const SX = 1
			const SY = 2
			const SZ = 3
			const SCALE_CONSTANT_LABEL = codeMapLabelService["LABEL_HEIGHT_COEFFICIENT"]

			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: true })
			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: true })

			const originalSpritePositionsA = codeMapLabelService["labels"][0].sprite.position.clone()

			const lineGeometry = codeMapLabelService["labels"][0].line.geometry as BufferGeometry

			const originalLineGeometryStartVertices = lineGeometry.attributes.position.clone()

			const scaledLabelA = codeMapLabelService["labels"][0]
			const scaledLabelB = codeMapLabelService["labels"][1]

			storeService.dispatch(setScaling(new Vector3(SX, SY, SZ)))

			const expectedScaledSpritePositions = new Vector3(
				originalSpritePositionsA.x * SX,
				(originalSpritePositionsA.y - SCALE_CONSTANT_LABEL * margin) * SY + SCALE_CONSTANT_LABEL * margin,
				originalSpritePositionsA.z * SZ
			)

			const expectedScaledLineGeometryStart = new Vector3(
				originalLineGeometryStartVertices.getX(0) * SX,
				originalLineGeometryStartVertices.getY(0) * SY,
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

		it("should apply scaling factor to a newly created label", () => {
			storeService.dispatch(setScaling(new Vector3(1, 2, 1)))
			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: false })

			const positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
			expect(positionWithoutDelta.y).toBe(41)
		})

		function assertLabelPositions(scaledLabel, expectedSpritePositions: Vector3, expectedScaledLineGeometryStart: Vector3) {
			expect(scaledLabel.sprite.position.x).toBe(expectedSpritePositions.x)
			expect(scaledLabel.sprite.position.y).toBe(expectedSpritePositions.y)
			expect(scaledLabel.sprite.position.z).toBe(expectedSpritePositions.z)

			const lineGeometry = scaledLabel.line.geometry as BufferGeometry
			const scaledLabelPos = lineGeometry.attributes.position

			expect(scaledLabelPos.getX(0)).toBe(expectedScaledLineGeometryStart.x)
			expect(scaledLabelPos.getY(0)).toBe(expectedScaledLineGeometryStart.y)
			expect(scaledLabelPos.getZ(0)).toBe(expectedScaledLineGeometryStart.z)

			expect(scaledLabelPos.getX(1)).toBe(expectedSpritePositions.x)
			expect(scaledLabelPos.getY(1)).toBe(expectedSpritePositions.y)
			expect(scaledLabelPos.getZ(1)).toBe(expectedSpritePositions.z)
		}
	})

	describe("clearTemporaryLabel", () => {
		const generateSceneLabelChild = (numberOfChildren: number): Object3D[] => {
			const generated = []
			for (let index = 0; index < numberOfChildren; index++) {
				generated[index] = ({ line: undefined, sprite: undefined } as unknown) as Object3D
			}
			return generated
		}
		it("should clear label for the correct node only", () => {
			storeService.dispatch(setAmountOfTopLabels(2))
			storeService.dispatch(setHeightMetric("mcc"))
			codeMapLabelService.dispose = jest.fn()
			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: false })
			codeMapLabelService.addLabel(otherSampleLeaf, { showNodeName: true, showNodeMetric: false })
			threeSceneService.labels.children = generateSceneLabelChild(4)

			codeMapLabelService.clearTemporaryLabel(sampleLeaf)

			expect(codeMapLabelService.dispose).toBeCalledWith(threeSceneService.labels.children)
			expect(threeSceneService.labels.children.length).toEqual(2)
			expect(codeMapLabelService["labels"][0].node).toEqual(otherSampleLeaf)
		})

		it("should not clear if no label exists for a given node", () => {
			storeService.dispatch(setAmountOfTopLabels(2))
			storeService.dispatch(setHeightMetric("mcc"))

			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: false })
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
		sprite.material = ({
			map: { dispose: jest.fn() },
			dispose: jest.fn()
		} as unknown) as SpriteMaterial
		sprite.geometry = ({ dispose: jest.fn() } as unknown) as BufferGeometry
		return sprite
	}

	const MockedLine = () => {
		const line = new Line()
		line.material = ({
			dispose: jest.fn()
		} as unknown) as LineBasicMaterial
		line.geometry = ({ dispose: jest.fn() } as unknown) as BufferGeometry
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
