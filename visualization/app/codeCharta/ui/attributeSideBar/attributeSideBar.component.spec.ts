import "./attributeSideBar.module"
import { AttributeSideBarController } from "./attributeSideBar.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService, ITimeoutService } from "angular"
import { CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"

describe("AttributeSideBarController", () => {
	let attributeSideBarController: AttributeSideBarController
	let $rootScope: IRootScopeService
	let $timeout: ITimeoutService
	let $mdSideNav

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.attributeSideBar")

		$rootScope = getService<IRootScopeService>("$rootScope")
		$timeout = getService<ITimeoutService>("$timeout")
	}

	function rebuildController() {
		attributeSideBarController = new AttributeSideBarController($rootScope, $timeout, $mdSideNav)
	}

	describe("constructor", () => {
		beforeEach(() => {
			CodeMapMouseEventService.subscribeToBuildingSelectedEvents = jest.fn()
		})

		it("should subscribe to Hovering-Events", () => {
			rebuildController()

			expect(CodeMapMouseEventService.subscribeToBuildingSelectedEvents).toHaveBeenCalledWith($rootScope, attributeSideBarController)
		})
	})
})
