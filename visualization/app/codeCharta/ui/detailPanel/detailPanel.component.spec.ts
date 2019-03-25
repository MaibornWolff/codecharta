import "./detailPanel.module"

import { SettingsService, Settings } from "../../state/settings.service"
import { DetailPanelController } from "./detailPanel.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService, ITimeoutService, IAngularEvent } from "angular"
import { CodeMapBuildingTransition } from "../codeMap/codeMap.mouseEvent.service"
import { services } from "@uirouter/core"
import { CodeChartaService } from "../../codeCharta.service"
import { MetricService } from "../../state/metric.service"
import { FileStateService } from "../../state/fileState.service"

describe("detailPanelController", function() {
	let services, detailPanelController: DetailPanelController

	beforeEach(function() {
		restartSystem()
		rebuildController()
		withMockedEventMethods()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.detailPanel")

		const CodeChartaServiceMock = jest.fn<CodeChartaService>(() => ({
			removeBlacklistEntry: jest.fn()
		}))

		services = {
			$rootScope: getService<IRootScopeService>("$rootScope"),
			settingsService: getService<SettingsService>("settingsService"),
			$timeout: getService<ITimeoutService>("$timeout"),
			codeChartaService: CodeChartaServiceMock,
			metricService: getService<MetricService>("metricService"),
			fileStateService: getService<FileStateService>("fileStateService")
		}
	}

	function rebuildController() {
		detailPanelController = new DetailPanelController(
			services.$rootScope,
			services.settingsService,
			services.$timeout,
			services.codeChartaService,
			services.metricService,
			services.fileStateService
		)
	}

	function withMockedEventMethods() {
		services.$rootScope.$on = detailPanelController["$rootScope"].$on = jest.fn()
		services.$rootScope.$broadcast = detailPanelController["$rootScope"].$broadcast = jest.fn()
	}

	afterEach(() => {
		jest.resetAllMocks()
	})

	describe("should react to method calls", () => {
		it("should call onHover when onBuildingHovered called", () => {
			detailPanelController.onHover = jest.fn()
			detailPanelController.onBuildingHovered(("data" as any) as CodeMapBuildingTransition, ("event" as any) as IAngularEvent)

			expect(detailPanelController.onHover).toBeCalledWith("data")
		})

		it("should call onSelect when onBuildingSelected called", () => {
			detailPanelController.onSelect = jest.fn()
			detailPanelController.onBuildingSelected(("data" as any) as CodeMapBuildingTransition, ("event" as any) as IAngularEvent)

			expect(detailPanelController.onSelect).toBeCalledWith("data")
		})
	})

	it("should set common attributes onSettingsChanged", () => {
		const settings = {
			dynamicSettings: {
				areaMetric: "a",
				colorMetric: "b",
				heightMetric: "c"
			},
			appSettings: {
				maximizeDetailPanel: true
			}
		} as Settings
		detailPanelController.onSettingsChanged(settings)
		expect(detailPanelController["_viewModel"].details.common.areaAttributeName).toBe("a")
		expect(detailPanelController["_viewModel"].details.common.colorAttributeName).toBe("b")
		expect(detailPanelController["_viewModel"].details.common.heightAttributeName).toBe("c")
		expect(detailPanelController["_viewModel"].maximizeDetailPanel).toBe(true)
	})

	it("should setSelectedDetails when valid node is selected", () => {
		const data = {
			from: null,
			to: {
				node: "somenode"
			}
		}
		detailPanelController.setSelectedDetails = jest.fn()
		detailPanelController.onSelect(data)
		expect(detailPanelController.setSelectedDetails).toHaveBeenCalledWith("somenode")
	})

	it("should clearSelectedDetails when invalid node is selected", () => {
		const data = {
			from: null,
			to: {
				notanode: "somenode"
			}
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
			to: {
				node: "somenode"
			}
		}
		detailPanelController.setHoveredDetails = jest.fn()
		detailPanelController.onHover(data)
		expect(detailPanelController.setHoveredDetails).toHaveBeenCalledWith("somenode")
	})

	it("should clearHoveredDetails when node is invalid", () => {
		const data = {
			from: null,
			to: {
				notanode: "somenode"
			}
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
