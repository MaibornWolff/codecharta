import "./attributeSideBar.module"
import { AttributeSideBarService } from "./attributeSideBar.service"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { CODE_MAP_BUILDING } from "../../util/dataMocks"
import _ from "lodash"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"

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
			ThreeSceneService.subscribeToBuildingSelectedEvents = jest.fn()

			rebuildService()

			expect(ThreeSceneService.subscribeToBuildingSelectedEvents).toHaveBeenCalledWith($rootScope, attributeSideBarService)
		})

		it("should subscribe to Node Deselected Events", () => {
			ThreeSceneService.subscribeToBuildingDeselectedEvents = jest.fn()

			rebuildService()

			expect(ThreeSceneService.subscribeToBuildingDeselectedEvents).toHaveBeenCalledWith($rootScope, attributeSideBarService)
		})
	})

	describe("onBuildingSelected", () => {
		it("should call function openSideBar", () => {
			attributeSideBarService.openSideBar = jest.fn()
			const codeMapBuilding = _.cloneDeep(CODE_MAP_BUILDING)

			attributeSideBarService.onBuildingSelected(codeMapBuilding)

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
