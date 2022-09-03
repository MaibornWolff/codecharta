import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { EdgeMetricDataService } from "./edgeMetricData.service"
import { FILE_STATES, VALID_NODE_WITH_PATH, withMockedEventMethods } from "../../../../util/dataMocks"
import { FilesService } from "../../files/files.service"
import { BlacklistService } from "../../fileSettings/blacklist/blacklist.service"
import { AttributeTypesService } from "../../fileSettings/attributeTypes/attributeTypes.service"
import { FileState } from "../../../../model/files/files"
import { clone } from "../../../../util/clone"
import { visibleFileStatesSelector } from "../../../selectors/visibleFileStates.selector"

const mockedVisibleFileStatesSelector = visibleFileStatesSelector as unknown as jest.Mock

jest.mock("../../../selectors/visibleFileStates.selector", () => ({
	visibleFileStatesSelector: jest.fn()
}))
jest.mock("../../fileSettings/blacklist/blacklist.selector", () => ({ blacklistSelector: () => [] }))

describe("EdgeMetricDataService", () => {
	let edgeMetricDataService: EdgeMetricDataService
	let storeService: StoreService
	let $rootScope: IRootScopeService

	let files: FileState[]

	beforeEach(() => {
		restartSystem()
		mockedVisibleFileStatesSelector.mockImplementation(() => files)
		edgeMetricDataService = new EdgeMetricDataService($rootScope, storeService)
		edgeMetricDataService["updateEdgeMetricData"]()

		withMockedEventMethods($rootScope)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")

		files = clone(FILE_STATES)
		files[0].file.map = clone(VALID_NODE_WITH_PATH)
	}

	function rebuildService() {
		edgeMetricDataService = new EdgeMetricDataService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to FilesService", () => {
			FilesService.subscribe = jest.fn()

			rebuildService()

			expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, edgeMetricDataService)
		})

		it("should subscribe to BlacklistService", () => {
			BlacklistService.subscribe = jest.fn()

			rebuildService()

			expect(BlacklistService.subscribe).toHaveBeenCalledWith($rootScope, edgeMetricDataService)
		})

		it("should subscribe to AttributeTypesService", () => {
			AttributeTypesService.subscribe = jest.fn()

			rebuildService()

			expect(AttributeTypesService.subscribe).toHaveBeenCalledWith($rootScope, edgeMetricDataService)
		})
	})
})
