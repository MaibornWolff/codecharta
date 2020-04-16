import "./maxTreeMapFiles.module"
import { MaxTreeMapFilesController } from "./maxTreeMapFiles.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { MaxTreeMapFilesService } from "../../state/store/appSettings/maxTreeMapFiles/maxTreeMapFiles.service"
import { maxTreeMapFiles } from "../../state/store/appSettings/maxTreeMapFiles/maxTreeMapFiles.reducer"
import _ from "lodash"

describe("MaxTreeMapFilesController", () => {
	let maxTreeMapFilesController: MaxTreeMapFilesController
	let $rootScope: IRootScopeService
	let storeService: StoreService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.maxTreeMapFiles")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildController() {
		maxTreeMapFilesController = new MaxTreeMapFilesController($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should should subscribe to maxTreeMapFilesService Events", () => {
			MaxTreeMapFilesService.subscribe = jest.fn()

			rebuildController()

			expect(MaxTreeMapFilesService.subscribe).toHaveBeenCalledWith($rootScope, maxTreeMapFilesController)
		})
	})
})
