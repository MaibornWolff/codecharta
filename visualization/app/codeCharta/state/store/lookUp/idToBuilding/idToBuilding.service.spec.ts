import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { IdToBuildingService } from "./idToBuilding.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"
import { ThreeSceneService } from "../../../../ui/codeMap/threeViewer/threeSceneService"

describe("IdToBuildingService", () => {
	let idToBuildingService: IdToBuildingService
	let storeService: StoreService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods($rootScope)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildService() {
		idToBuildingService = new IdToBuildingService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to CodeMapMeshChange", () => {
			ThreeSceneService.subscribeToCodeMapMeshChangedEvent = jest.fn()

			rebuildService()

			expect(ThreeSceneService.subscribeToCodeMapMeshChangedEvent).toHaveBeenCalledWith($rootScope, idToBuildingService)
		})
	})
})
