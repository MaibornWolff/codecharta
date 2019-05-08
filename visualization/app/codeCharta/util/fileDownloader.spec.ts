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

		it("should not have multiple timestamps", () => {
			file.fileMeta.fileName = "foo_2019-04-22_18-01.cc.json"
			TEST_FILE_DATA_DOWNLOADED.fileName = "foo_2018-12-14_9-39.cc.json"

			FileDownloader.downloadCurrentMap(file)

			expect(FileDownloader["downloadData"]).toHaveBeenCalledWith(TEST_FILE_DATA_DOWNLOADED, TEST_FILE_DATA_DOWNLOADED.fileName)
		})

		it("should insert the valid date", () => {
			file.fileMeta.fileName = "prefix.name.suffix.cc.json"
			TEST_FILE_DATA_DOWNLOADED.fileName = "prefix.name.suffix_2018-12-14_9-39.cc.json"

			FileDownloader.downloadCurrentMap(file)

			expect(FileDownloader["downloadData"]).toHaveBeenCalledWith(TEST_FILE_DATA_DOWNLOADED, TEST_FILE_DATA_DOWNLOADED.fileName)
		})

		it("should insert the date and use .cc.json as ending instead of just .json", () => {
			file.fileMeta.fileName = "prefix.name.suffix.json"
			TEST_FILE_DATA_DOWNLOADED.fileName = "prefix.name.suffix_2018-12-14_9-39.cc.json"

			FileDownloader.downloadCurrentMap(file)

			expect(FileDownloader["downloadData"]).toHaveBeenCalledWith(TEST_FILE_DATA_DOWNLOADED, TEST_FILE_DATA_DOWNLOADED.fileName)
		})

		it("should replace the date with the valid one", () => {
			file.fileMeta.fileName = "prefix.name.suffix_2000-01-01_01-01.cc.json"
			TEST_FILE_DATA_DOWNLOADED.fileName = "prefix.name.suffix_2018-12-14_9-39.cc.json"

			FileDownloader.downloadCurrentMap(file)

			expect(FileDownloader["downloadData"]).toHaveBeenCalledWith(TEST_FILE_DATA_DOWNLOADED, TEST_FILE_DATA_DOWNLOADED.fileName)
		})

		it("should replace the date with the valid one and use .cc.json as ending instead of just .json", () => {
			file.fileMeta.fileName = "prefix.name.suffix_2000-01-01_01-01.json"
			TEST_FILE_DATA_DOWNLOADED.fileName = "prefix.name.suffix_2018-12-14_9-39.cc.json"

			FileDownloader.downloadCurrentMap(file)

			expect(FileDownloader["downloadData"]).toHaveBeenCalledWith(TEST_FILE_DATA_DOWNLOADED, TEST_FILE_DATA_DOWNLOADED.fileName)
		})
	})
})
