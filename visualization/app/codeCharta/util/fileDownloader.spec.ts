import { stubDate } from "../../../mocks/dateMock.helper"
import { FileDownloader } from "./fileDownloader"
import { CCFile } from "../codeCharta.model"
import { TEST_FILE_DATA, TEST_FILE_DATA_DOWNLOADED } from "./dataMocks"

describe("fileDownloader", () => {
	let file: CCFile
	stubDate(new Date("2018-12-14T09:39:59"))

	beforeEach(() => {
		file = TEST_FILE_DATA

		FileDownloader["downloadData"] = jest.fn()
	})

	describe("downloadCurrentMap", () => {
		it("should", () => {
			FileDownloader.downloadCurrentMap(file)

			expect(FileDownloader["downloadData"]).toHaveBeenCalledTimes(1)
			expect(FileDownloader["downloadData"]).toHaveBeenCalledWith(TEST_FILE_DATA_DOWNLOADED, TEST_FILE_DATA_DOWNLOADED.fileName)
			expect(FileDownloader.downloadCurrentMap(file)).toMatchSnapshot()
		})
	})
	describe("downloadCurrentMap", () => {
		it("should", () => {
			file.fileMeta.fileName = "foo.2019-04-22_18-01.cc.json"
			TEST_FILE_DATA_DOWNLOADED.fileName = "foo.2018-12-14_9-39.cc.json"

			FileDownloader.downloadCurrentMap(file)

			expect(FileDownloader["downloadData"]).toHaveBeenCalledWith(TEST_FILE_DATA_DOWNLOADED, TEST_FILE_DATA_DOWNLOADED.fileName)
		})
	})
})
