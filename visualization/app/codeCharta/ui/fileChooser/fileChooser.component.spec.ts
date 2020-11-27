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
import { NameDataPair } from "../../codeCharta.model"

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
			const file: NameDataPair = {
				fileName,
				fileSize: 42,
				content
			}

			fileChooserController["files"] = [file]

			fileChooserController.setNewData()

			expect(codeChartaService.loadFiles).toHaveBeenCalledWith([file])
		})
	})

	describe("addNameDataPair", () => {
		it("should generate and append md5-file-checksum if it is missing or empty", () => {
			fileChooserController["files"] = []

			const file0 = {
				name: "invalid.with.md5.checksum.cc.json",
				size: 42
			} as File

			const file1 = {
				name: "invalid.and.missing.md5.checksum.cc.json",
				size: 42
			} as File

			const file2 = {
				name: "invalid.and.empty.md5.checksum.cc.json",
				size: 42
			} as File

			const file3 = {
				name: "invalid.and.nulled.md5.checksum.cc.json",
				size: 42
			} as File

			fileChooserController["addNameDataPair"](file0, '{"fileChecksum":"invalid-but-present-md5-checksum"}')

			expect(fileChooserController["files"].length).toBe(1)
			expect(fileChooserController["files"][0].fileName).toBe("invalid.with.md5.checksum.cc.json")
			expect(fileChooserController["files"][0].content.fileChecksum).toBe("invalid-but-present-md5-checksum")

			fileChooserController["addNameDataPair"](file1, "{}")

			expect(fileChooserController["files"].length).toBe(2)
			expect(fileChooserController["files"][1].fileName).toBe("invalid.and.missing.md5.checksum.cc.json")
			expect(fileChooserController["files"][1].content.fileChecksum).toBe("99914b932bd37a50b983c5e7c90ae93b")

			fileChooserController["addNameDataPair"](file2, '{"fileChecksum":""}')

			expect(fileChooserController["files"].length).toBe(3)
			expect(fileChooserController["files"][2].fileName).toBe("invalid.and.empty.md5.checksum.cc.json")
			expect(fileChooserController["files"][2].content.fileChecksum).toBe("21a6f66227ae28300d656b8107765e7f")

			fileChooserController["addNameDataPair"](file3, '{"fileChecksum":null}')

			expect(fileChooserController["files"].length).toBe(4)
			expect(fileChooserController["files"][3].fileName).toBe("invalid.and.nulled.md5.checksum.cc.json")
			expect(fileChooserController["files"][3].content.fileChecksum).toBe("44f0fdb79d97053b25dce38611c117f0")
		})
	})
})
