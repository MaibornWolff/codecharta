import "./detailPanel.module"
import "../codeMap/codeMap.module"
import "../../state/state.module"
import "../../codeCharta.module"

import { SettingsService } from "../../state/settings.service"
import { DetailPanelController } from "./detailPanel.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService, ITimeoutService } from "angular"
import { CodeMapBuildingTransition, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { FileStateService } from "../../state/fileState.service"
import { Settings } from "../../codeCharta.model"
import { CODE_MAP_BUILDING, SETTINGS } from "../../util/dataMocks"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import _ from "lodash"
import { MetricService } from "../../state/metric.service"

describe("detailPanelController", () => {
	let detailPanelController: DetailPanelController

	let $rootScope: IRootScopeService
	let settingsService: SettingsService
	let $timeout: ITimeoutService
	let fileStateService: FileStateService

	let settings: Settings
	let codeMapBuilding: CodeMapBuilding

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedEventMethods()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.detailPanel")

		$rootScope = getService<IRootScopeService>("$rootScope")
		settingsService = getService<SettingsService>("settingsService")
		$timeout = getService<ITimeoutService>("$timeout")
		fileStateService = getService<FileStateService>("fileStateService")

		settings = _.cloneDeep(SETTINGS)
		codeMapBuilding = _.cloneDeep(CODE_MAP_BUILDING)
	}

	function rebuildController() {
		detailPanelController = new DetailPanelController($rootScope, settingsService, $timeout, fileStateService)
	}

	function withMockedEventMethods() {
		$rootScope.$on = detailPanelController["$rootScope"].$on = jest.fn()
		$rootScope.$broadcast = detailPanelController["$rootScope"].$broadcast = jest.fn()
	}

	afterEach(() => {
		jest.resetAllMocks()
	})

	describe("constructor", () => {
		beforeEach(() => {
			MetricService.subscribe = jest.fn()
			SettingsService.subscribe = jest.fn()
			SettingsService.subscribeToBlacklist = jest.fn()
			CodeMapMouseEventService.subscribeToBuildingHoveredEvents = jest.fn()
			CodeMapMouseEventService.subscribeToBuildingSelectedEvents = jest.fn()
		})

		it("should subscribe to MetricService", () => {
			rebuildController()

			expect(MetricService.subscribe).toHaveBeenCalledWith($rootScope, detailPanelController)
		})

		it("should subscribe to Settings-Changed-Event", () => {
			rebuildController()

			expect(SettingsService.subscribe).toHaveBeenCalledWith($rootScope, detailPanelController)
		})

		it("should subscribe to Blacklist-Changed-Event", () => {
			rebuildController()

			expect(SettingsService.subscribeToBlacklist).toHaveBeenCalledWith($rootScope, detailPanelController)
		})

		it("should subscribe to Building-Hovered-Event", () => {
			rebuildController()

			expect(CodeMapMouseEventService.subscribeToBuildingHoveredEvents).toHaveBeenCalledWith($rootScope, detailPanelController)
		})

		it("should subscribe to Building-Selected-Event", () => {
			rebuildController()

			expect(CodeMapMouseEventService.subscribeToBuildingSelectedEvents).toHaveBeenCalledWith($rootScope, detailPanelController)
		})
	})

	describe("should react to method calls", () => {
		it("should call onHover when onBuildingHovered called", () => {
			detailPanelController.onHover = jest.fn()
			detailPanelController.onBuildingHovered(("data" as any) as CodeMapBuildingTransition)

			expect(detailPanelController.onHover).toBeCalledWith("data")
		})

		it("should call onSelect when onBuildingSelected called", () => {
			detailPanelController.onSelect = jest.fn()
			detailPanelController.onBuildingSelected(("data" as any) as CodeMapBuildingTransition)

			expect(detailPanelController.onSelect).toBeCalledWith("data")
		})
	})

	it("should set common attributes onSettingsChanged", () => {
		detailPanelController.onSettingsChanged(settings, undefined)

		expect(detailPanelController["_viewModel"].details.common.areaAttributeName).toBe("rloc")
		expect(detailPanelController["_viewModel"].details.common.colorAttributeName).toBe("mcc")
		expect(detailPanelController["_viewModel"].details.common.heightAttributeName).toBe("mcc")
		expect(detailPanelController["_viewModel"].maximizeDetailPanel).toBe(false)
	})

	describe("onBlacklistChanged", () => {
		it("should reset hovered and selected when map rebuilds", () => {
			const expected = detailPanelController["_viewModel"].details

			detailPanelController.onBlacklistChanged([])

			expect(detailPanelController["_viewModel"].details.hovered).toEqual(expected.hovered)
			expect(detailPanelController["_viewModel"].details.selected).toEqual(expected.selected)
		})
	})

	it("should setSelectedDetails when valid node is selected", () => {
		const data = {
			from: null,
			to: codeMapBuilding
		}

		detailPanelController.setSelectedDetails = jest.fn()
		detailPanelController.onSelect(data)
		expect(detailPanelController.setSelectedDetails).toHaveBeenCalledWith(codeMapBuilding.node)
	})

	it("should clearSelectedDetails when invalid node is selected", () => {
		const data = {
			from: null,
			to: codeMapBuilding
		}
		detailPanelController.clearSelectedDetails = jest.fn()
		detailPanelController.onSelect(data)
		expect(detailPanelController.clearSelectedDetails).toHaveBeenCalled()
	})

	it("should clearSelectedDetails when invalid transition is given", () => {
		detailPanelController.clearSelectedDetails = jest.fn()

		const data = {
			notato: {
				node: "somenode"
			},
			from: null,
			to: null
		}
		detailPanelController.onSelect(data)
		expect(detailPanelController.clearSelectedDetails).toHaveBeenCalled()
	})

	it("should clearSelectedDetails when no node is selected", () => {
		const data = {
			from: null,
			to: null
		}
		detailPanelController.clearSelectedDetails = jest.fn()
		detailPanelController.onSelect(data)
		expect(detailPanelController.clearSelectedDetails).toHaveBeenCalled()
	})

	it("should setHoveredDetails when valid node is hovered", () => {
		const data = {
			from: null,
			to: codeMapBuilding
		}
		detailPanelController.setHoveredDetails = jest.fn()
		detailPanelController.onHover(data)
		expect(detailPanelController.setHoveredDetails).toHaveBeenCalledWith(codeMapBuilding.node)
	})

	it("should clearHoveredDetails when node is invalid", () => {
		const data = {
			from: null,
			to: codeMapBuilding
		}
		detailPanelController.clearHoveredDetails = jest.fn()
		detailPanelController.onHover(data)
		expect(detailPanelController.clearHoveredDetails).toHaveBeenCalled()
	})

	it("should clearHoveredDetails when transition is invalid", () => {
		detailPanelController.clearHoveredDetails = jest.fn()

		const data = {
			notato: {
				node: "somenode"
			},
			from: null,
			to: null
		}
		detailPanelController.onHover(data)
		expect(detailPanelController.clearHoveredDetails).toHaveBeenCalled()
	})

	it("should clearHoveredDetails when no node is hovered", () => {
		detailPanelController.clearHoveredDetails = jest.fn()
		const data = {
			from: null,
			to: null
		}
		detailPanelController.onHover(data)
		expect(detailPanelController.clearHoveredDetails).toHaveBeenCalled()
	})

	describe("isHovered and isSelected should evaluate the respective nodes name to determine the result", () => {
		it("empty details should result in false", () => {
			detailPanelController["_viewModel"].details = {} as any
			expect(detailPanelController.isHovered()).toBe(false)
			expect(detailPanelController.isSelected()).toBe(false)
		})

		it("empty nodes should result in false", () => {
			detailPanelController["_viewModel"].details = {
				hovered: null,
				selected: null
			} as any
			expect(detailPanelController.isHovered()).toBe(false)
			expect(detailPanelController.isSelected()).toBe(false)
		})

		it("named nodes should result in true", () => {
			detailPanelController["_viewModel"].details = {
				hovered: {
					name: "some name"
				} as any,
				selected: {
					name: "some name"
				} as any
			} as any
			expect(detailPanelController.isHovered()).toBe(true)
			expect(detailPanelController.isSelected()).toBe(true)
		})
	})
})
