import { stubDate } from "../../../mocks/dateMock.helper"
import { FileDownloader } from "./fileDownloader"
import { FileMeta, CodeMapNode, FileSettings, BlacklistType } from "../codeCharta.model"
import { TEST_FILE_DATA, TEST_FILE_DATA_DOWNLOADED, VALID_NODE_DECORATED, VALID_EDGES_DECORATED } from "./dataMocks"
import { DownloadCheckboxNames } from "../ui/dialog/dialog.download.component"
import { Blacklist } from "../model/blacklist"

describe("fileDownloader", () => {
	let map: CodeMapNode
	let fileMeta: FileMeta
	let fileSettings: FileSettings
	let fileName: string
	let fileNameWithExtension: string
	let downloadSettingsNames: string[]
	stubDate(new Date("2018-12-14T09:39:59"))

	beforeEach(() => {
		map = VALID_NODE_DECORATED
		fileMeta = TEST_FILE_DATA.fileMeta
		fileSettings = TEST_FILE_DATA.settings.fileSettings
		fileSettings.edges = VALID_EDGES_DECORATED
		fileSettings.blacklist = new Blacklist([
			{ path: "/root/bigLeaf.ts", type: BlacklistType.flatten },
			{ path: "/root/sample1OnlyLeaf.scss", type: BlacklistType.exclude }
		])
		fileName = "foo_2019-04-22_18-01"
		fileNameWithExtension = "foo_2019-04-22_18-01.cc.json"
		FileDownloader["downloadData"] = jest.fn()
	})

	describe("downloadCurrentMap", () => {
		it("should call downloadData with undecorated ExportCCFile", () => {
			downloadSettingsNames = []
			const expected = JSON.parse(JSON.stringify(TEST_FILE_DATA_DOWNLOADED))
			expected.blacklist = []
			expected.edges = []

			FileDownloader.downloadCurrentMap(map, fileMeta, fileSettings, downloadSettingsNames, fileName)

			expect(FileDownloader["downloadData"]).toHaveBeenCalledTimes(1)
			expect(FileDownloader["downloadData"]).toHaveBeenCalledWith(expected, fileNameWithExtension)
		})

		it("should call downloadData with undecorated ExportCCFile including undecorated edges", () => {
			downloadSettingsNames = [DownloadCheckboxNames.edges]
			const expected = JSON.parse(JSON.stringify(TEST_FILE_DATA_DOWNLOADED))
			expected.blacklist = []

			FileDownloader.downloadCurrentMap(map, fileMeta, fileSettings, downloadSettingsNames, fileName)

			expect(FileDownloader["downloadData"]).toHaveBeenCalledTimes(1)
			expect(FileDownloader["downloadData"]).toHaveBeenCalledWith(expected, fileNameWithExtension)
		})

		it("should call downloadData with undecorated ExportCCFile including blacklist", () => {
			downloadSettingsNames = [DownloadCheckboxNames.excludes, DownloadCheckboxNames.flattens]
			const expected = JSON.parse(JSON.stringify(TEST_FILE_DATA_DOWNLOADED))
			expected.edges = []

			FileDownloader.downloadCurrentMap(map, fileMeta, fileSettings, downloadSettingsNames, fileName)

			expect(FileDownloader["downloadData"]).toHaveBeenCalledTimes(1)
			expect(FileDownloader["downloadData"]).toHaveBeenCalledWith(expected, fileNameWithExtension)
		})
	})
})
