import "./attributeSideBar.module"
import { AttributeSideBarDeltasController } from "./attributeSideBar.deltas.component"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService, ITimeoutService } from "angular"
import { CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { SettingsService } from "../../state/settingsService/settings.service"
import { SETTINGS, CODE_MAP_BUILDING } from "../../util/dataMocks"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { Settings } from "../../codecharta.model"
import _ from "lodash"

describe("AttributeSideBarDeltasController", () => {
	let attributeSideBarDeltasController: AttributeSideBarDeltasController
	let $rootScope: IRootScopeService
	let $timeout: ITimeoutService
	let threeSceneService: ThreeSceneService
	let settingsService: SettingsService

	beforeEach(() => {
		restartSystem()
		withMockedThreeSceneService()
		withMockedSettingsService()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.attributeSideBar")

		$rootScope = getService<IRootScopeService>("$rootScope")
		$timeout = getService<ITimeoutService>("$timeout")
		threeSceneService = getService<ThreeSceneService>("threeSceneService")
		settingsService = getService<SettingsService>("settingsService")
	}

	function rebuildController() {
		attributeSideBarDeltasController = new AttributeSideBarDeltasController($rootScope, $timeout, threeSceneService, settingsService)
	}

	function withMockedThreeSceneService() {
		threeSceneService = jest.fn().mockReturnValue({
			getSelectedBuilding: jest.fn()
		})()
	}

	function withMockedSettingsService() {
		settingsService = jest.fn().mockReturnValue({
			getSettings: jest.fn()
		})()
	}

	describe("constructor", () => {
		it("should subscribe to Node Selected Events", () => {
			CodeMapMouseEventService.subscribeToBuildingSelectedEvents = jest.fn()

			rebuildController()

			expect(CodeMapMouseEventService.subscribeToBuildingSelectedEvents).toHaveBeenCalledWith(
				$rootScope,
				attributeSideBarDeltasController
			)
		})

		it("should subscribe to SettingsService", () => {
			SettingsService.subscribe = jest.fn()

			rebuildController()

			expect(SettingsService.subscribe).toHaveBeenCalledWith($rootScope, attributeSideBarDeltasController)
		})
	})

	describe("onBuildingSelected", () => {
		beforeEach(() => {
			attributeSideBarDeltasController["setDeltaColorClass"] = jest.fn()
			attributeSideBarDeltasController["setDeltaValue"] = jest.fn()
		})
		it("should call function setDeltaValue", () => {
			attributeSideBarDeltasController.onBuildingSelected("mySelectedBuilding" as CodeMapBuilding)

			expect(attributeSideBarDeltasController["setDeltaValue"]).toHaveBeenCalledWith("mySelectedBuilding")
		})

		it("should call function setDeltaColorClass", () => {
			attributeSideBarDeltasController.onBuildingSelected("mySelectedBuilding" as CodeMapBuilding)

			expect(attributeSideBarDeltasController["setDeltaColorClass"]).toHaveBeenCalled()
		})
	})

	describe("onSettingsChanged", () => {
		let settings: Settings

		beforeEach(() => {
			attributeSideBarDeltasController["setDeltaColorClass"] = jest.fn()
			settings = _.cloneDeep(SETTINGS)
		})

		it("should call function setDeltaColorClass with invertDeltaColors is false", () => {
			const update = {
				appSettings: {
					invertDeltaColors: false
				}
			}

			attributeSideBarDeltasController.onSettingsChanged(settings, update)

			expect(attributeSideBarDeltasController["setDeltaColorClass"]).toHaveBeenCalledWith(settings)
		})

		it("should call function setDeltaColorClass with invertDeltaColors is true", () => {
			const update = {
				appSettings: {
					invertDeltaColors: true
				}
			}

			attributeSideBarDeltasController.onSettingsChanged(settings, update)

			expect(attributeSideBarDeltasController["setDeltaColorClass"]).toHaveBeenCalledWith(settings)
		})

		it("should not call function setDeltaColorClass when invertDeltaColors is not in update object", () => {
			const update = {
				appSettings: {}
			}

			attributeSideBarDeltasController.onSettingsChanged(settings, update)

			expect(attributeSideBarDeltasController["setDeltaColorClass"]).not.toHaveBeenCalled()
		})

		it("should not call function setDeltaColorClass when appSettings is not in update object", () => {
			const update = { somethingelse: true } as RecursivePartial<Settings>

			attributeSideBarDeltasController.onSettingsChanged(settings, update)

			expect(attributeSideBarDeltasController["setDeltaColorClass"]).not.toHaveBeenCalled()
		})
	})

	describe("setDeltaValue", () => {
		let codeMapBuilding: CodeMapBuilding

		beforeEach(() => {
			codeMapBuilding = _.cloneDeep(CODE_MAP_BUILDING)
			attributeSideBarDeltasController["_viewModel"] = {
				deltaValue: null,
				colorClass: null,
				attributekey: null
			}
		})

		it("should set deltaValue to null", () => {
			codeMapBuilding.node.deltas = undefined

			attributeSideBarDeltasController["setDeltaValue"](codeMapBuilding)

			expect(attributeSideBarDeltasController["_viewModel"].deltaValue).toEqual(null)
		})

		it("should set deltaValue to existing metric value", () => {
			codeMapBuilding.node.deltas = { rloc: 42 }
			attributeSideBarDeltasController["attributekey"] = "rloc"

			attributeSideBarDeltasController["setDeltaValue"](codeMapBuilding)

			expect(attributeSideBarDeltasController["_viewModel"].deltaValue).toEqual(42)
		})

		it("should not change viewModel", () => {
			codeMapBuilding = undefined
			attributeSideBarDeltasController["_viewModel"].deltaValue = 17

			attributeSideBarDeltasController["setDeltaValue"](codeMapBuilding)

			expect(attributeSideBarDeltasController["_viewModel"].deltaValue).toEqual(17)
		})
	})

	describe("setDeltaColorClass", () => {
		let settings: Settings

		beforeEach(() => {
			settings = _.cloneDeep(SETTINGS)
		})

		it("should set colorClass to red with inverted deltaColor and positive deltaValue", () => {
			settings.appSettings.invertDeltaColors = true
			attributeSideBarDeltasController["_viewModel"].deltaValue = 1

			attributeSideBarDeltasController["setDeltaColorClass"](settings)

			expect(attributeSideBarDeltasController["_viewModel"].colorClass).toEqual("red")
		})

		it("should set colorClass to green with inverted deltaColor and negative deltaValue", () => {
			settings.appSettings.invertDeltaColors = true
			attributeSideBarDeltasController["_viewModel"].deltaValue = -1

			attributeSideBarDeltasController["setDeltaColorClass"](settings)

			expect(attributeSideBarDeltasController["_viewModel"].colorClass).toEqual("green")
		})

		it("should set colorClass to green without inverted deltaColor and positive deltaValue", () => {
			settings.appSettings.invertDeltaColors = false
			attributeSideBarDeltasController["_viewModel"].deltaValue = 1

			attributeSideBarDeltasController["setDeltaColorClass"](settings)

			expect(attributeSideBarDeltasController["_viewModel"].colorClass).toEqual("green")
		})

		it("should set colorClass to red without inverted deltaColor and negative deltaValue", () => {
			settings.appSettings.invertDeltaColors = false
			attributeSideBarDeltasController["_viewModel"].deltaValue = -1

			attributeSideBarDeltasController["setDeltaColorClass"](settings)

			expect(attributeSideBarDeltasController["_viewModel"].colorClass).toEqual("red")
		})
	})
})
