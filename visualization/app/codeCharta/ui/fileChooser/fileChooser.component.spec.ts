import "./fileChooser.module"
import "../../codeCharta.module"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { CodeChartaService } from "../../codeCharta.service"
import { DialogService } from "../dialog/dialog.service"
import { FileChooserController } from "./fileChooser.component"
import { TEST_FILE_CONTENT, withMockedEventMethods } from "../../util/dataMocks"
import _ from "lodash"
import { StoreService } from "../../state/store.service"

describe("fileChooserController", () => {
	let fileChooserController: FileChooserController
	let $rootScope: IRootScopeService
	let dialogService: DialogService
	let codeChartaService: CodeChartaService
	let storeSevice: StoreService

	let fileName: string
	let content: any

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedEventMethods($rootScope)
		withMockedDialogService()
		withMockedCodeChartaService()
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.fileChooser")

		$rootScope = getService<IRootScopeService>("$rootScope")
		dialogService = getService<DialogService>("dialogService")
		codeChartaService = getService<CodeChartaService>("codeChartaService")
		storeSevice = getService<StoreService>("storeService")

		fileName = "someFile.json"
		content = _.cloneDeep(TEST_FILE_CONTENT)
	}

	function rebuildController() {
		fileChooserController = new FileChooserController($rootScope, dialogService, codeChartaService, storeSevice)
	}

	function withMockedDialogService() {
		dialogService = fileChooserController["dialogService"] = jest.fn().mockReturnValue({
			showErrorDialog: jest.fn()
		})()
	}

	function withMockedCodeChartaService() {
		codeChartaService = fileChooserController["codeChartaService"] = jest.fn().mockReturnValue({
			loadFiles: jest.fn().mockReturnValue({ catch: jest.fn() })
		})()
	}

	describe("onImportNewFiles", () => {
		it("should call $apply", () => {
			fileChooserController.onImportNewFiles({ files: [] })

			expect($rootScope.$apply).toHaveBeenCalled()
		})

		it("should not set state if no file loaded", () => {
			fileChooserController.onImportNewFiles({ files: [] })

			expect(storeSevice.getState().appSettings.isLoadingFile).toBeTruthy()
		})
	})

	describe("setNewData", () => {
		it("should call loadFiles", () => {
			fileChooserController.setNewData(fileName, JSON.stringify(content))

			expect(codeChartaService.loadFiles).toHaveBeenCalledWith([
				{
					fileName,
					content
				}
			])
		})
	})
})
