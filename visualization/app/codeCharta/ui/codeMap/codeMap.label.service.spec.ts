import "./codeMap.module"
import "../../codeCharta.module"
import { CodeMapLabelService } from "./codeMap.label.service"
import { Node } from "../../codeCharta.model"
import { BoxGeometry, Group, Mesh, PerspectiveCamera, Vector3 } from "three"
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
		})

		it("should add label if node has a height attribute mentioned in renderSettings", () => {
			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: true }, 100)

			expect(codeMapLabelService["labels"].length).toBe(1)
		})

		it("should add label even if node has a height attribute value of 0", () => {
			sampleLeaf.attributes = { mcc: 0 }

			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: true }, 100)

			expect(codeMapLabelService["labels"].length).toBe(1)
		})

		it("should calculate correct height without delta with node name only", () => {
			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: false }, 0)

			const positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
			expect(positionWithoutDelta.y).toBe(31)
		})

		it("should calculate correct height without delta with metric values only", () => {
			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: false }, 0)

			const positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
			expect(positionWithoutDelta.y).toBe(31)
		})

		it("should use node height value if nodeHeight is greater than the nodes height ", () => {
			codeMapLabelService["nodeHeight"] = 100
			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: false }, 0)

			const positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
			expect(positionWithoutDelta.y).toBe(131)
		})

		it("should use the nodes actual height if its greater then node height( by construction this is is only the case for temporary labels)", () => {
			codeMapLabelService["nodeHeight"] = 0
			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: false }, 10)

			const positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
			expect(positionWithoutDelta.y).toBe(41)
		})

		it("should calculate correct height without delta for two line label: node name and metric value", () => {
			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: true }, 0)

			const positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
			expect(positionWithoutDelta.y).toBe(46)
		})

		it("should set the text correctly, creating a two line label", () => {
			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: true }, 0)

			const lineCount = codeMapLabelService["labels"][0].lineCount
			expect(lineCount).toBe(2)
		})

		it("should set the text correctly, creating a one line label", () => {
			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: false }, 0)

			const lineCount = codeMapLabelService["labels"][0].lineCount
			expect(lineCount).toBe(1)
		})

		it("scaling existing labels multiple times should scale their position correctly", () => {
			const { margin } = storeService.getState().dynamicSettings
			const SX = 1
			const SY = 2
			const SZ = 3
			const SCALE_CONSTANT_LABEL = codeMapLabelService["LABEL_HEIGHT_COEFFICIENT"]

			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: true }, 0)
			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: true }, 0)

			const originalSpritePositionsA = codeMapLabelService["labels"][0].sprite.position.clone()
			const originalLineGeometryStartVertices = codeMapLabelService["labels"][0].line.geometry["vertices"][0].clone()

			const scaledLabelA = codeMapLabelService["labels"][0]
			const scaledLabelB = codeMapLabelService["labels"][1]

			storeService.dispatch(setScaling(new Vector3(SX, SY, SZ)))

			const expectedScaledSpritePositions = new Vector3(
				originalSpritePositionsA.x * SX,
				(originalSpritePositionsA.y - SCALE_CONSTANT_LABEL * margin) * SY + SCALE_CONSTANT_LABEL * margin,
				originalSpritePositionsA.z * SZ
			)

			const expectedScaledLineGeometryStart = new Vector3(
				originalLineGeometryStartVertices.x * SX,
				originalLineGeometryStartVertices.y * SY,
				originalLineGeometryStartVertices.z * SZ
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
			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: false }, 0)

			const positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
			expect(positionWithoutDelta.y).toBe(37)
		})

		function assertLabelPositions(scaledLabel, expectedSpritePositions: Vector3, expectedScaledLineGeometryStart: Vector3) {
			expect(scaledLabel.sprite.position.x).toBe(expectedSpritePositions.x)
			expect(scaledLabel.sprite.position.y).toBe(expectedSpritePositions.y)
			expect(scaledLabel.sprite.position.z).toBe(expectedSpritePositions.z)

			expect(scaledLabel.line.geometry.vertices[0].x).toBe(expectedScaledLineGeometryStart.x)
			expect(scaledLabel.line.geometry.vertices[0].y).toBe(expectedScaledLineGeometryStart.y)
			expect(scaledLabel.line.geometry.vertices[0].z).toBe(expectedScaledLineGeometryStart.z)

			expect(scaledLabel.line.geometry.vertices[1].x).toBe(expectedSpritePositions.x)
			expect(scaledLabel.line.geometry.vertices[1].y).toBe(expectedSpritePositions.y)
			expect(scaledLabel.line.geometry.vertices[1].z).toBe(expectedSpritePositions.z)
		}
	})

	describe("clearTemporaryLabel", () => {
		it("should clear label for the correct node only", () => {
			storeService.dispatch(setAmountOfTopLabels(2))
			storeService.dispatch(setHeightMetric("mcc"))

			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: false }, 0)
			codeMapLabelService.addLabel(otherSampleLeaf, { showNodeName: true, showNodeMetric: false }, 0)
			threeSceneService.labels.children.length = 4

			codeMapLabelService.clearTemporaryLabel(sampleLeaf)

			expect(threeSceneService.labels.children.length).toEqual(2)
			expect(codeMapLabelService["labels"][0].node).toEqual(otherSampleLeaf)
		})

		it("should not clear if no label exists for a given node", () => {
			storeService.dispatch(setAmountOfTopLabels(2))
			storeService.dispatch(setHeightMetric("mcc"))

			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: false }, 0)
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
})
