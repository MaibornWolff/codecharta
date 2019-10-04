import "./metricDeltaSelected.module"
import { MetricDeltaSelectedController } from "./metricDeltaSelected.component"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService, ITimeoutService } from "angular"
import { CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { SettingsService } from "../../state/settingsService/settings.service"
import { SETTINGS, CODE_MAP_BUILDING } from "../../util/dataMocks"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { Settings } from "../../codecharta.model"
import _ from "lodash"

describe("MetricDeltaSelectedController", () => {
	let metricDeltaSelectedController: MetricDeltaSelectedController
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
		instantiateModule("app.codeCharta.ui.metricDeltaSelected")

		$rootScope = getService<IRootScopeService>("$rootScope")
		$timeout = getService<ITimeoutService>("$timeout")
		threeSceneService = getService<ThreeSceneService>("threeSceneService")
		settingsService = getService<SettingsService>("settingsService")
	}

	function rebuildController() {
		metricDeltaSelectedController = new MetricDeltaSelectedController($rootScope, $timeout, threeSceneService, settingsService)
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
				metricDeltaSelectedController
			)
		})

		it("should subscribe to SettingsService", () => {
			SettingsService.subscribe = jest.fn()

			rebuildController()

			expect(SettingsService.subscribe).toHaveBeenCalledWith($rootScope, metricDeltaSelectedController)
		})
	})

	describe("onBuildingSelected", () => {
		beforeEach(() => {
			metricDeltaSelectedController["setDeltaColorClass"] = jest.fn()
			metricDeltaSelectedController["setDeltaValue"] = jest.fn()
		})
		it("should call function setDeltaValue", () => {
			metricDeltaSelectedController.onBuildingSelected("mySelectedBuilding" as CodeMapBuilding)

			expect(metricDeltaSelectedController["setDeltaValue"]).toHaveBeenCalledWith("mySelectedBuilding")
		})

		it("should call function setDeltaColorClass", () => {
			metricDeltaSelectedController.onBuildingSelected("mySelectedBuilding" as CodeMapBuilding)

			expect(metricDeltaSelectedController["setDeltaColorClass"]).toHaveBeenCalled()
		})
	})

	describe("onSettingsChanged", () => {
		let settings: Settings

		beforeEach(() => {
			metricDeltaSelectedController["setDeltaColorClass"] = jest.fn()
			settings = _.cloneDeep(SETTINGS)
		})

		it("should call function setDeltaColorClass with invertDeltaColors is false", () => {
			const update = {
				appSettings: {
					invertDeltaColors: false
				}
			}

			metricDeltaSelectedController.onSettingsChanged(settings, update)

			expect(metricDeltaSelectedController["setDeltaColorClass"]).toHaveBeenCalledWith(settings)
		})

		it("should call function setDeltaColorClass with invertDeltaColors is true", () => {
			const update = {
				appSettings: {
					invertDeltaColors: true
				}
			}

			metricDeltaSelectedController.onSettingsChanged(settings, update)

			expect(metricDeltaSelectedController["setDeltaColorClass"]).toHaveBeenCalledWith(settings)
		})

		it("should not call function setDeltaColorClass when invertDeltaColors is not in update object", () => {
			const update = {
				appSettings: {}
			}

			metricDeltaSelectedController.onSettingsChanged(settings, update)

			expect(metricDeltaSelectedController["setDeltaColorClass"]).not.toHaveBeenCalled()
		})

		it("should not call function setDeltaColorClass when appSettings is not in update object", () => {
			const update = { somethingelse: true } as RecursivePartial<Settings>

			metricDeltaSelectedController.onSettingsChanged(settings, update)

			expect(metricDeltaSelectedController["setDeltaColorClass"]).not.toHaveBeenCalled()
		})
	})

	describe("setDeltaValue", () => {
		let codeMapBuilding: CodeMapBuilding

		beforeEach(() => {
			codeMapBuilding = _.cloneDeep(CODE_MAP_BUILDING)
			metricDeltaSelectedController["_viewModel"] = {
				deltaValue: null,
				colorClass: null,
				attributekey: null
			}
		})

		it("should set deltaValue to null", () => {
			codeMapBuilding.node.deltas = undefined

			metricDeltaSelectedController["setDeltaValue"](codeMapBuilding)

			expect(metricDeltaSelectedController["_viewModel"].deltaValue).toEqual(null)
		})

		it("should set deltaValue to existing metric value", () => {
			codeMapBuilding.node.deltas = { rloc: 42 }
			metricDeltaSelectedController["attributekey"] = "rloc"

			metricDeltaSelectedController["setDeltaValue"](codeMapBuilding)

			expect(metricDeltaSelectedController["_viewModel"].deltaValue).toEqual(42)
		})

		it("should not change viewModel", () => {
			codeMapBuilding = undefined
			metricDeltaSelectedController["_viewModel"].deltaValue = 17

			metricDeltaSelectedController["setDeltaValue"](codeMapBuilding)

			expect(metricDeltaSelectedController["_viewModel"].deltaValue).toEqual(17)
		})
	})

	describe("setDeltaColorClass", () => {
		let settings: Settings

		beforeEach(() => {
			settings = _.cloneDeep(SETTINGS)
		})

		it("should set colorClass to red with inverted deltaColor and positive deltaValue", () => {
			settings.appSettings.invertDeltaColors = true
			metricDeltaSelectedController["_viewModel"].deltaValue = 1

			metricDeltaSelectedController["setDeltaColorClass"](settings)

			expect(metricDeltaSelectedController["_viewModel"].colorClass).toEqual("red")
		})

		it("should set colorClass to green with inverted deltaColor and negative deltaValue", () => {
			settings.appSettings.invertDeltaColors = true
			metricDeltaSelectedController["_viewModel"].deltaValue = -1

			metricDeltaSelectedController["setDeltaColorClass"](settings)

			expect(metricDeltaSelectedController["_viewModel"].colorClass).toEqual("green")
		})

		it("should set colorClass to green without inverted deltaColor and positive deltaValue", () => {
			settings.appSettings.invertDeltaColors = false
			metricDeltaSelectedController["_viewModel"].deltaValue = 1

			metricDeltaSelectedController["setDeltaColorClass"](settings)

			expect(metricDeltaSelectedController["_viewModel"].colorClass).toEqual("green")
		})

		it("should set colorClass to red without inverted deltaColor and negative deltaValue", () => {
			settings.appSettings.invertDeltaColors = false
			metricDeltaSelectedController["_viewModel"].deltaValue = -1

			metricDeltaSelectedController["setDeltaColorClass"](settings)

			expect(metricDeltaSelectedController["_viewModel"].colorClass).toEqual("red")
		})
	})
})
