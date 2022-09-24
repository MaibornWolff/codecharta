import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { NodeMetricDataService } from "./nodeMetricData.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"
import { BlacklistService } from "../../fileSettings/blacklist/blacklist.service"
import { FilesService } from "../../files/files.service"

describe("NodeMetricDataService", () => {
	let nodeMetricDataService: NodeMetricDataService
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
		nodeMetricDataService = new NodeMetricDataService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to FilesService", () => {
			FilesService.subscribe = jest.fn()

			rebuildService()

			expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, nodeMetricDataService)
		})

		it("should subscribe to BlacklistService", () => {
			BlacklistService.subscribe = jest.fn()

			rebuildService()

			expect(BlacklistService.subscribe).toHaveBeenCalledWith($rootScope, nodeMetricDataService)
		})
	})
})
