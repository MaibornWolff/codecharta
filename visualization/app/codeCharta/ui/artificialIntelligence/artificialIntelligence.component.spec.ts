import "./artificialIntelligence.module"
import { ArtificialIntelligenceController } from "./artificialIntelligence.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { setFiles } from "../../state/store/files/files.actions"
import { FILE_STATES } from "../../util/dataMocks"
import * as FilesHelper from "../../model/files/files.helper"

describe("ArtificialIntelligenceController", () => {
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let artificialIntelligenceController: ArtificialIntelligenceController

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.artificialIntelligence")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")

		storeService.dispatch(setFiles(FILE_STATES))
	}

	function rebuildController() {
		artificialIntelligenceController = new ArtificialIntelligenceController($rootScope, storeService)
	}

	describe("artificialIntelligenceComponent", () => {
		it("should do something", () => {
			//TODO: Implement tests
			jest.spyOn(FilesHelper, "getVisibleFileStates").mockReturnValue([])
			artificialIntelligenceController.onFilesSelectionChanged([])
			expect(FilesHelper.getVisibleFileStates).toHaveBeenCalledTimes(1)
		})
	})
})
