import { stubDate } from "../../../mocks/dateMock.helper"
import { DownloadableSetting, FileDownloader } from "./fileDownloader"
import { BlacklistType, CodeMapNode, FileMeta, FileSettings } from "../codeCharta.model"
import {
	TEST_ATTRIBUTE_DESCRIPTORS_HALF_FILLED,
	TEST_ATTRIBUTE_TYPES,
	TEST_FILE_DATA,
	TEST_FILE_DATA_DOWNLOADED,
	VALID_EDGES_DECORATED,
	VALID_NODE_DECORATED
} from "./dataMocks"
import { klona } from "klona"

describe("fileDownloader", () => {
	let map: CodeMapNode
	let fileMeta: FileMeta
	let filesettings: FileSettings
	let fileName: string
	let fileNameWithExtension: string
	let downloadSettings: DownloadableSetting[]
	stubDate(new Date("2018-12-14T09:39:59"))

	beforeEach(() => {
		map = VALID_NODE_DECORATED
		fileMeta = TEST_FILE_DATA.fileMeta
		filesettings = TEST_FILE_DATA.settings.fileSettings
		filesettings.edges = VALID_EDGES_DECORATED
		filesettings.attributeTypes = TEST_ATTRIBUTE_TYPES
		filesettings.attributeDescriptors = TEST_ATTRIBUTE_DESCRIPTORS_HALF_FILLED
		filesettings.blacklist = [
			{ path: "/root/bigLeaf.ts", type: BlacklistType.flatten },
			{ path: "/root/sample1OnlyLeaf.scss", type: BlacklistType.exclude }
		]
		fileName = "foo_2019-04-22_18-01"
		fileNameWithExtension = "foo_2019-04-22_18-01.cc.json"
		FileDownloader["downloadData"] = jest.fn()
	})

	describe("downloadCurrentMap", () => {
		it("should call downloadData with undecorated ExportCCFile", () => {
			downloadSettings = []

			const expected = klona(TEST_FILE_DATA_DOWNLOADED)
			expected.blacklist = []
			expected.edges = []

			FileDownloader.downloadCurrentMap(map, fileMeta, filesettings, downloadSettings, fileName)

			expect(FileDownloader["downloadData"]).toHaveBeenCalledTimes(1)
			expect(FileDownloader["downloadData"]).toHaveBeenCalledWith(JSON.stringify(expected), fileNameWithExtension)
		})

		it("should call downloadData with undecorated ExportCCFile including undecorated edges", () => {
			downloadSettings = ["Edges"]

			const expected = klona(TEST_FILE_DATA_DOWNLOADED)
			expected.blacklist = []

			FileDownloader.downloadCurrentMap(map, fileMeta, filesettings, downloadSettings, fileName)

			expect(FileDownloader["downloadData"]).toHaveBeenCalledTimes(1)
			expect(FileDownloader["downloadData"]).toHaveBeenCalledWith(JSON.stringify(expected), fileNameWithExtension)
		})

		it("should call downloadData with undecorated ExportCCFile including blacklist", () => {
			downloadSettings = ["Excludes", "Flattens"]

			const expected = klona(TEST_FILE_DATA_DOWNLOADED)
			expected.edges = []

			FileDownloader.downloadCurrentMap(map, fileMeta, filesettings, downloadSettings, fileName)

			expect(FileDownloader["downloadData"]).toHaveBeenCalledTimes(1)
			expect(FileDownloader["downloadData"]).toHaveBeenCalledWith(JSON.stringify(expected), fileNameWithExtension)
		})

		it("should call downloadData with undecorated ExportCCFile including attribute Types", () => {
			downloadSettings = ["AttributeTypes"]

			const expected = klona(TEST_FILE_DATA_DOWNLOADED)
			expected.attributeTypes = TEST_ATTRIBUTE_TYPES
			expected.edges = []
			expected.blacklist = []

			FileDownloader.downloadCurrentMap(map, fileMeta, filesettings, downloadSettings, fileName)

			expect(FileDownloader["downloadData"]).toHaveBeenCalledTimes(1)
			expect(FileDownloader["downloadData"]).toHaveBeenCalledWith(JSON.stringify(expected), fileNameWithExtension)
		})

		it("should call downloadData with undecorated ExportCCFile including attribute Descriptors", () => {
			downloadSettings = ["AttributeDescriptors"]

			const expected = klona(TEST_FILE_DATA_DOWNLOADED)
			expected.attributeDescriptors = TEST_ATTRIBUTE_DESCRIPTORS_HALF_FILLED
			expected.edges = []
			expected.blacklist = []

			FileDownloader.downloadCurrentMap(map, fileMeta, filesettings, downloadSettings, fileName)

			expect(FileDownloader["downloadData"]).toHaveBeenCalledTimes(1)
			expect(FileDownloader["downloadData"]).toHaveBeenCalledWith(JSON.stringify(expected), fileNameWithExtension)
		})
	})
})
