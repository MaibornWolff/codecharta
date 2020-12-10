import { ExportBlacklistType, ExportCCFile } from "../codeCharta.api.model"
import { AttributeTypeValue, BlacklistType, CCFile, NameDataPair } from "../codeCharta.model"
import { getCCFile, getSelectedFilesSize } from "./fileHelper"
import { TEST_FILE_CONTENT } from "./dataMocks"
import { clone } from "./clone"
import { FileSelectionState, FileState } from "../model/files/files"
import packageJson from "../../../package.json"

describe("FileHelper", () => {
	let fileContent: ExportCCFile

	beforeEach(() => {
		fileContent = clone(TEST_FILE_CONTENT)
	})

	describe("getCCFile", () => {
		it("should build a CCFile", () => {
			const nameDataPair: NameDataPair = { content: fileContent, fileName: "fileName", fileSize: 30 }
			const result = getCCFile(nameDataPair)

			expect(result).toMatchSnapshot()
		})

		it("should convert old blacklist type", () => {
			fileContent.blacklist = [{ path: "foo", type: ExportBlacklistType.hide }]

			const nameDataPair: NameDataPair = { content: fileContent, fileName: "fileName", fileSize: 30 }
			const result = getCCFile(nameDataPair)

			expect(result.settings.fileSettings.blacklist).toEqual([{ path: "foo", type: BlacklistType.flatten }])
		})

		it("should ignore old attribute types", () => {
			fileContent.attributeTypes = {
				nodes: [{ mcc: AttributeTypeValue.absolute }],
				edges: [{ pairingRate: AttributeTypeValue.relative }]
			}

			const nameDataPair: NameDataPair = { content: fileContent, fileName: "fileName", fileSize: 30 }
			const result = getCCFile(nameDataPair)

			expect(result.settings.fileSettings.attributeTypes).toEqual({ nodes: {}, edges: {} })
		})

		it("should return empty attributeTypes", () => {
			fileContent.attributeTypes = {}

			const nameDataPair: NameDataPair = { content: fileContent, fileName: "fileName", fileSize: 30 }
			const result = getCCFile(nameDataPair)

			expect(result.settings.fileSettings.attributeTypes).toEqual({ nodes: {}, edges: {} })
		})

		it("should return empty attributeTypes if the property doesn't exist", () => {
			fileContent.attributeTypes = undefined

			const nameDataPair: NameDataPair = { content: fileContent, fileName: "fileName", fileSize: 30 }
			const result = getCCFile(nameDataPair)

			expect(result.settings.fileSettings.attributeTypes).toEqual({ nodes: {}, edges: {} })
		})
	})

	describe("getSelectedFilesSize", () => {
		it("should sum up sizes of selected files", () => {
			const file1 = {
				fileMeta: {
					fileName: "file1",
					fileChecksum: "invalid-md5-checksum-1",
					projectName: "Sample Project",
					apiVersion: packageJson.codecharta.apiVersion,
					exportedFileSize: 10
				}
			} as CCFile

			const file2 = {
				fileMeta: {
					fileName: "file2",
					fileChecksum: "invalid-md5-checksum-2",
					projectName: "Sample Project",
					apiVersion: packageJson.codecharta.apiVersion,
					exportedFileSize: 10
				}
			} as CCFile

			const unselectedFile = {
				fileMeta: {
					fileName: "unselectedFile",
					fileChecksum: "invalid-md5-checksum-3",
					projectName: "Sample Project",
					apiVersion: packageJson.codecharta.apiVersion,
					exportedFileSize: 10
				}
			} as CCFile

			const severalFiles: FileState[] = [
				{
					file: file1,
					selectedAs: FileSelectionState.Partial
				},
				{
					file: file2,
					selectedAs: FileSelectionState.Comparison
				},
				{
					file: unselectedFile,
					selectedAs: FileSelectionState.None
				}
			]

			expect(getSelectedFilesSize(severalFiles)).toBe(20)
		})
	})
})
