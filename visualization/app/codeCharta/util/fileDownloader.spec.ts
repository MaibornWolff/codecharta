import { stubDate } from "../../../mocks/dateMock.helper"
import { FileDownloader } from "./fileDownloader"
import { CCFile } from "../codeCharta.model"
import { TEST_FILE_DATA, TEST_FILE_DATA_DOWNLOADED } from "./dataMocks"
import { DownloadCheckboxNames } from "../ui/dialog/dialog.download.component"

describe("fileDownloader", () => {
	let file: CCFile
	let downloadedFile: any
	stubDate(new Date("2018-12-14T09:39:59"))

	beforeEach(() => {
		file = TEST_FILE_DATA
		downloadedFile = TEST_FILE_DATA_DOWNLOADED
		FileDownloader["downloadData"] = jest.fn()
	})

	describe("downloadCurrentMap", () => {
		it("should download map correctly", () => {
			const fileName = "foo_2019-04-22_18-01"
			const fileNameWithExtension = "foo_2019-04-22_18-01.cc.json"
			const downloadSettingsNames: string[] = [
				DownloadCheckboxNames.edges,
				DownloadCheckboxNames.excludes,
				DownloadCheckboxNames.hides
			]
			FileDownloader.downloadCurrentMap(file, downloadSettingsNames, fileName)

			expect(FileDownloader["downloadData"]).toHaveBeenCalledTimes(1)
			expect(FileDownloader["downloadData"]).toHaveBeenCalledWith(downloadedFile, fileNameWithExtension)
		})
	})
})
