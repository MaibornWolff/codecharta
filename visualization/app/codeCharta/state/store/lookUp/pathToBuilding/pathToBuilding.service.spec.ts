import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { PathToBuildingService } from "./pathToBuilding.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"
import { ThreeSceneService } from "../../../../ui/codeMap/threeViewer/threeSceneService"

describe("PathToBuildingService", () => {
	let pathToBuildingService: PathToBuildingService
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
		pathToBuildingService = new PathToBuildingService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to CodeMapMeshChange", () => {
			ThreeSceneService.subscribeToCodeMapMeshChangedEvent = jest.fn()

			rebuildService()

			expect(ThreeSceneService.subscribeToCodeMapMeshChangedEvent).toHaveBeenCalledWith($rootScope, pathToBuildingService)
		})
	})
})
