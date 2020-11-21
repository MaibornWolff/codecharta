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
			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: true })

			expect(codeMapLabelService["labels"].length).toBe(1)
		})

		it("should not add label if node has not a height attribute mentioned in renderSettings", () => {
			sampleLeaf.attributes = { notsome: 0 }

			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: true })

			expect(codeMapLabelService["labels"].length).toBe(0)
		})

		it("should calculate correct height without delta with node name only", () => {
			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: false })

			const positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
			expect(positionWithoutDelta.y).toBe(93)
		})

		it("should calculate correct height without delta with metric values only", () => {
			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: false })

			const positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
			expect(positionWithoutDelta.y).toBe(93)
		})

		it("should calculate correct height without delta for two line label: node name and metric value", () => {
			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: true })

			const positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
			expect(positionWithoutDelta.y).toBe(108)
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

		it("scaling existing labels should scale their position correctly", () => {
			const SX = 1
			const SY = 2
			const SZ = 3

			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: true })
			codeMapLabelService.addLabel(sampleLeaf, { showNodeName: true, showNodeMetric: true })

			const scaleBeforeA: Vector3 = new Vector3(
				codeMapLabelService["labels"][0].sprite.position.x,
				codeMapLabelService["labels"][0].sprite.position.y,
				codeMapLabelService["labels"][0].sprite.position.z
			)
			storeService.dispatch(setScaling(new Vector3(SX, SY, SZ)))

			codeMapLabelService.scale()

			const scaleAfterA: Vector3 = codeMapLabelService["labels"][0].sprite.position
			const scaleAfterB: Vector3 = codeMapLabelService["labels"][1].sprite.position

			expect(scaleAfterA.x).toBe(scaleBeforeA.x * SX)
			expect(scaleAfterA.y).toBe((scaleBeforeA.y - 60) * SY + 60)
			expect(scaleAfterA.z).toBe(scaleBeforeA.z * SZ)

			expect(scaleAfterB.x).toBe(scaleBeforeA.x * SX)
			expect(scaleAfterB.y).toBe((scaleBeforeA.y - 60) * SY + 60)
			expect(scaleAfterB.z).toBe(scaleBeforeA.z * SZ)
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
