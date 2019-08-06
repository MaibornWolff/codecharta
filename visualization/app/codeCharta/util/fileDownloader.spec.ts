import { stubDate } from "../../../mocks/dateMock.helper"
import { FileDownloader } from "./fileDownloader"
import { FileMeta, CodeMapNode, FileSettings } from "../codeCharta.model"
import { TEST_FILE_DATA, TEST_FILE_DATA_DOWNLOADED } from "./dataMocks"
import { DownloadCheckboxNames } from "../ui/dialog/dialog.download.component"

describe("fileDownloader", () => {
	let map: CodeMapNode
	let fileMeta: FileMeta
	let filesettings: FileSettings
	let fileName: string
	let fileNameWithExtension: string
	let downloadSettingsNames: string[]
	stubDate(new Date("2018-12-14T09:39:59"))

	beforeEach(() => {
		map = TEST_FILE_DATA.map
		fileMeta = TEST_FILE_DATA.fileMeta
		filesettings = TEST_FILE_DATA.settings.fileSettings
		fileName = "foo_2019-04-22_18-01"
		fileNameWithExtension = "foo_2019-04-22_18-01.cc.json"
		downloadSettingsNames = [DownloadCheckboxNames.edges, DownloadCheckboxNames.excludes, DownloadCheckboxNames.hides]

		FileDownloader["downloadData"] = jest.fn()
	})

	describe("downloadCurrentMap", () => {
		it("should call downloadData with correct parameter data", () => {
			FileDownloader.downloadCurrentMap(map, fileMeta, filesettings, downloadSettingsNames, fileName)

			expect(FileDownloader["downloadData"]).toHaveBeenCalledTimes(1)
			expect(FileDownloader["downloadData"]).toHaveBeenCalledWith(TEST_FILE_DATA_DOWNLOADED, fileNameWithExtension)
		})
	})
})
