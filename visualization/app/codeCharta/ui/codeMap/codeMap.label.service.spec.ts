import "./codeMap.module"
import "../../codeCharta.module"
import { CodeMapLabelService } from "./codeMap.label.service"
import { Node, Settings } from "../../codeCharta.model"
import { Vector3 } from "three"
import { ThreeCameraService } from "./threeViewer/threeCameraService"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { DEFAULT_SETTINGS, SETTINGS } from "../../util/dataMocks"
import { SettingsService } from "../../state/settings.service"

describe("CodeMapLabelService", () => {
	let $rootScope: IRootScopeService
	let settingsService: SettingsService
	let threeCameraService: ThreeCameraService
	let threeSceneService: ThreeSceneService
	let codeMapLabelService: CodeMapLabelService
	let createElementOrigin
	let sampleSettings: Settings
	let sampleLeaf: Node
	let canvasCtxMock

	beforeEach(() => {
		restartSystem()
		withMockedEventMethods()
		withMockedThreeCameraService()
		withMockedThreeSceneService()
		withMockedSettingsService()
		rebuild()
		setCanvasRenderSettings()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")

		$rootScope = getService<IRootScopeService>("$rootScope")
		settingsService = getService<SettingsService>("settingsService")
		threeCameraService = getService<ThreeCameraService>("threeCameraService")
		threeSceneService = getService<ThreeSceneService>("threeSceneService")
	}

	function rebuild() {
		codeMapLabelService = new CodeMapLabelService($rootScope, settingsService, threeCameraService, threeSceneService)
	}

	function withMockedEventMethods() {
		$rootScope.$on = jest.fn()

		$rootScope.$broadcast = jest.fn()
	}

	function withMockedThreeCameraService() {
		threeCameraService = jest.fn<ThreeCameraService>(() => {
			return {
				camera: {
					position: {
						distanceTo: jest.fn()
					}
				}
			}
		})()
	}

	function withMockedThreeSceneService() {
		threeSceneService = jest.fn<ThreeSceneService>(() => {
			return {
				mapGeometry: jest.fn(),
				labels: {
					add: jest.fn(),
					children: jest.fn()
				}
			}
		})()
	}

	function withMockedSettingsService() {
		settingsService = jest.fn<SettingsService>(() => {
			return {
				getSettings: jest.fn().mockReturnValue(DEFAULT_SETTINGS)
			}
		})()
	}

	function setCanvasRenderSettings() {
		sampleSettings = SETTINGS

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

		canvasCtxMock = {
			font: "",
			measureText: jest.fn(),
			fillRect: jest.fn(),
			fillText: jest.fn(),
			strokeRect: jest.fn()
		}

		createElementOrigin = document.createElement

		document.createElement = jest.fn(() => {
			return {
				getContext: () => {
					return canvasCtxMock
				}
			}
		})

		canvasCtxMock.measureText.mockReturnValue({ width: 10 })
	}

	afterEach(() => {
		document.createElement = createElementOrigin
	})

	it("should have no labels stored after construction", () => {
		expect(codeMapLabelService["labels"].length).toBe(0)
	})

	it("addLabel should add label if node has a height attribute mentioned in renderSettings", () => {
		codeMapLabelService.addLabel(sampleLeaf, sampleSettings)
		expect(codeMapLabelService["labels"].length).toBe(1)
	})

	it("addLabel should not add label if node has not a height attribute mentioned in renderSettings", () => {
		sampleLeaf.attributes = { notsome: 0 }
		codeMapLabelService.addLabel(sampleLeaf, sampleSettings)
		expect(codeMapLabelService["labels"].length).toBe(0)
	})

	it("addLabel should calculate correct height without delta", () => {
		codeMapLabelService.addLabel(sampleLeaf, sampleSettings)
		let positionWithoutDelta: Vector3 = codeMapLabelService["labels"][0].sprite.position
		expect(positionWithoutDelta.y).toBe(93)
	})

	it("clearLabel should clear parent in scene and internal labels", () => {
		codeMapLabelService.clearLabels()
		expect(codeMapLabelService["threeSceneService"].labels.children.length).toBe(0)
		expect(codeMapLabelService["labels"].length).toBe(0)
	})

	it("scaling existing labels should scale their position correctly", () => {
		const SX = 1
		const SY = 2
		const SZ = 3

		codeMapLabelService.addLabel(sampleLeaf, sampleSettings)
		codeMapLabelService.addLabel(sampleLeaf, sampleSettings)

		const scaleBeforeA: Vector3 = new Vector3(
			codeMapLabelService["labels"][0].sprite.position.x,
			codeMapLabelService["labels"][0].sprite.position.y,
			codeMapLabelService["labels"][0].sprite.position.z
		)

		codeMapLabelService.scale(new Vector3(SX, SY, SZ))

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
