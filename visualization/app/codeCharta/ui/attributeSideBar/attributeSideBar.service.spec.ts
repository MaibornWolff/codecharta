import "./attributeSideBar.module"
import { AttributeSideBarService } from "./attributeSideBar.service"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"

describe("AttributeSideBarService", () => {
	let attributeSideBarService: AttributeSideBarService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.attributeSideBar")

		$rootScope = getService<IRootScopeService>("$rootScope")
	}

	function rebuildService() {
		attributeSideBarService = new AttributeSideBarService($rootScope)
	}

	describe("constructor", () => {
		it("should subscribe to Node Selected Events", () => {
			CodeMapMouseEventService.subscribeToBuildingSelectedEvents = jest.fn()

			rebuildService()

			expect(CodeMapMouseEventService.subscribeToBuildingSelectedEvents).toHaveBeenCalledWith($rootScope, attributeSideBarService)
		})

		it("should subscribe to Node Deselected Events", () => {
			CodeMapMouseEventService.subscribeToBuildingDeselectedEvents = jest.fn()

			rebuildService()

			expect(CodeMapMouseEventService.subscribeToBuildingDeselectedEvents).toHaveBeenCalledWith($rootScope, attributeSideBarService)
		})
	})

	describe("onBuildingSelected", () => {
		it("should call function openSideBar", () => {
			attributeSideBarService.openSideBar = jest.fn()

			attributeSideBarService.onBuildingSelected("mySelectedBuilding")

			expect(attributeSideBarService.openSideBar).toHaveBeenCalled()
		})
	})

	describe("onBuildingDeselected", () => {
		it("should call function closeSideBar", () => {
			attributeSideBarService.closeSideBar = jest.fn()

			attributeSideBarService.onBuildingDeselected()

			expect(attributeSideBarService.closeSideBar).toHaveBeenCalled()
		})
	})

	describe("openSideBar", () => {
		it("should set new visibility state", () => {
			attributeSideBarService["isAttributeSideBarVisible"] = null

			attributeSideBarService.openSideBar()

			expect(attributeSideBarService["isAttributeSideBarVisible"]).toEqual(true)
		})

		it("should call function notify", () => {
			attributeSideBarService["notify"] = jest.fn()

			attributeSideBarService.openSideBar()

			expect(attributeSideBarService["notify"]).toHaveBeenCalled()
		})
	})

	describe("closeSideBar", () => {
		it("should set new visibility state", () => {
			attributeSideBarService["isAttributeSideBarVisible"] = null

			attributeSideBarService.closeSideBar()

			expect(attributeSideBarService["isAttributeSideBarVisible"]).toEqual(false)
		})

		it("should call function notify", () => {
			attributeSideBarService["notify"] = jest.fn()

			attributeSideBarService.closeSideBar()

			expect(attributeSideBarService["notify"]).toHaveBeenCalled()
		})
	})
})
