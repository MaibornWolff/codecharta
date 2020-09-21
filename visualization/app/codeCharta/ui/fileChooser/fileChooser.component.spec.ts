import "./fileChooser.module"
import "../../codeCharta.module"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { CodeChartaService } from "../../codeCharta.service"
import { FileChooserController } from "./fileChooser.component"
import { TEST_FILE_CONTENT, withMockedEventMethods } from "../../util/dataMocks"
import { StoreService } from "../../state/store.service"
import { clone } from "../../util/clone"
import { ExportCCFile } from "../../codeCharta.api.model"

describe("fileChooserController", () => {
	let fileChooserController: FileChooserController
	let $rootScope: IRootScopeService
	let codeChartaService: CodeChartaService
	let storeSevice: StoreService

	let fileName: string
	let content: ExportCCFile

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedEventMethods($rootScope)
		withMockedCodeChartaService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.fileChooser")

		$rootScope = getService<IRootScopeService>("$rootScope")
		codeChartaService = getService<CodeChartaService>("codeChartaService")
		storeSevice = getService<StoreService>("storeService")

		fileName = "someFile.json"
		content = clone(TEST_FILE_CONTENT)
	}

	function rebuildController() {
		fileChooserController = new FileChooserController($rootScope, codeChartaService, storeSevice)
	}

	function withMockedCodeChartaService() {
		codeChartaService = fileChooserController["codeChartaService"] = jest.fn().mockReturnValue({
			loadFiles: jest.fn().mockReturnValue({ catch: jest.fn() })
		})()
	}

	describe("setNewData", () => {
		it("should call loadFiles with read files", () => {
			fileChooserController["files"] = [{ fileName, content }]

			fileChooserController.setNewData()

			expect(codeChartaService.loadFiles).toHaveBeenCalledWith([
				{
					fileName,
					content
				}
			])
		})
	})
})
