import "./attributeSideBar.module"
import { AttributeSideBarController } from "./attributeSideBar.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"

describe("AttributeSideBarController", () => {
	let attributeSideBarController: AttributeSideBarController
	let $rootScope: IRootScopeService
	let $mdSideNav

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.attributeSideBar")

		$rootScope = getService<IRootScopeService>("$rootScope")
	}

	function rebuildController() {
		attributeSideBarController = new AttributeSideBarController($rootScope, $mdSideNav)
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
