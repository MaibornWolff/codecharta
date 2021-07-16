import "./artificialIntelligence.module"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCameraService"
import { ArtificialIntelligenceController } from "./artificialIntelligence.component"
import { FilesService } from "../../state/store/files/files.service"
import { CustomConfig } from "../../model/customConfig/customConfig.api.model"
import { CustomConfigHelper } from "../../util/customConfigHelper"
import { setFiles } from "../../state/store/files/files.actions"
import { FILE_STATES, FILE_STATES_JAVA } from "../../util/dataMocks"
import { setState } from "../../state/store/state.actions"

describe("ArtificialIntelligenceController", () => {
	let artificialIntelligenceCobtroller: ArtificialIntelligenceController
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let threeOrbitControlsService: ThreeOrbitControlsService
	let threeCameraService: ThreeCameraService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.artificialIntelligence")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		threeOrbitControlsService = getService<ThreeOrbitControlsService>("storeService")
		threeCameraService = getService<ThreeCameraService>("storeService")

		storeService.dispatch(setFiles(FILE_STATES))
	}

	function rebuildController() {
		artificialIntelligenceCobtroller = new ArtificialIntelligenceController(
			$rootScope,
			storeService,
			threeOrbitControlsService,
			threeCameraService
		)
	}

	describe("constructor", () => {
		it("should subscribe to file service", () => {
			FilesService.subscribe = jest.fn()

			rebuildController()

			expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, artificialIntelligenceCobtroller)
		})
	})

	describe("apply custom Config", () => {
		it("should call store.dispatch", () => {
			const customConfigStub = {
				stateSettings: {
					dynamicSettings: {
						margin: 1,
						colorRange: { from: 1, to: 2 }
					}
				}
			} as CustomConfig

			CustomConfigHelper.getCustomConfigSettings = jest.fn().mockReturnValue(customConfigStub)
			storeService.dispatch = jest.fn()
			threeOrbitControlsService.setControlTarget = jest.fn()

			artificialIntelligenceCobtroller.applyCustomConfig("CustomConfig1")

			expect(storeService.dispatch).toHaveBeenCalledWith(setState(customConfigStub.stateSettings))
		})
	})

	describe("on files selection changed", () => {
		it("should not call function createCustomConfigSuggestions", () => {
			artificialIntelligenceCobtroller["createCustomConfigSuggestions"] = jest.fn()
			artificialIntelligenceCobtroller.onFilesSelectionChanged(FILE_STATES)
			expect(artificialIntelligenceCobtroller["createCustomConfigSuggestions"]).not.toHaveBeenCalled()
		})
		it("should call function createCustomConfigSuggestions", () => {
			artificialIntelligenceCobtroller["createCustomConfigSuggestions"] = jest.fn()
			artificialIntelligenceCobtroller.onFilesSelectionChanged(FILE_STATES_JAVA)
			expect(artificialIntelligenceCobtroller["createCustomConfigSuggestions"]).toHaveBeenCalled()
		})

		it("should call function calculateRiskProfile", () => {
			artificialIntelligenceCobtroller["calculateRiskProfile"] = jest.fn()
			artificialIntelligenceCobtroller.onFilesSelectionChanged(FILE_STATES_JAVA)
			expect(artificialIntelligenceCobtroller["calculateRiskProfile"]).toHaveBeenCalled()
		})
	})
})
