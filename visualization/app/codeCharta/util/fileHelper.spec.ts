import { ExportBlacklistType, ExportCCFile } from "../codeCharta.api.model"
import { AttributeTypeValue, CCFile, NameDataPair } from "../codeCharta.model"
import { getCCFile, getCCFileAndDecorateFileChecksum, getSelectedFilesSize } from "./fileHelper"
import { TEST_ATTRIBUTE_DESCRIPTORS_HALF_FILLED, TEST_FILE_CONTENT } from "./dataMocks"
import { clone } from "./clone"
import { FileSelectionState, FileState } from "../model/files/files"
import packageJson from "../../../package.json"
import md5 from "md5"

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

			expect(result.settings.fileSettings.blacklist).toEqual([{ path: "foo", type: "flatten" }])
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

		it("should return attributeTypes if nodes exist", () => {
			fileContent.attributeTypes = {
				nodes: { test: AttributeTypeValue.absolute },
				edges: {}
			}

			const nameDataPair: NameDataPair = { content: fileContent, fileName: "fileName", fileSize: 30 }
			const result = getCCFile(nameDataPair)

			expect(result.settings.fileSettings.attributeTypes).toEqual({
				nodes: { test: AttributeTypeValue.absolute },
				edges: {}
			})
		})

		it("should return attributeTypes if nodes exist", () => {
			fileContent.attributeDescriptors = TEST_ATTRIBUTE_DESCRIPTORS_HALF_FILLED

			const nameDataPair: NameDataPair = { content: fileContent, fileName: "fileName", fileSize: 30 }
			const result = getCCFile(nameDataPair)

			expect(result.settings.fileSettings.attributeDescriptors).toEqual(TEST_ATTRIBUTE_DESCRIPTORS_HALF_FILLED)
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

	describe("getCCFileAndDecorateFileChecksum", () => {
		it("should resolve a json string in version 1.3 and higher and decorate checksum", () => {
			const expectedMD5 = md5('{"apiVersion":"1.3"}')
			const ccFile = getCCFileAndDecorateFileChecksum('{"checksum":"","data":{"apiVersion":"1.3"}}')

			expect(ccFile.apiVersion).toBe("1.3")
			expect(ccFile.fileChecksum).toBe(expectedMD5)
		})

		it("should resolve a json string in version 1.3 and higher and does not decorate checksum", () => {
			const ccFile = getCCFileAndDecorateFileChecksum('{"checksum":"fake-checksum","data":{"apiVersion":"1.3"}}')

			expect(ccFile.apiVersion).toBe("1.3")
			expect(ccFile.fileChecksum).toBe("fake-checksum")
		})

		it("should resolve a json string in version less than 1.3 and decorate checksum", () => {
			const expectedMD5 = md5('{"apiVersion":"1.2"}')
			const ccFile = getCCFileAndDecorateFileChecksum('{"apiVersion":"1.2"}')

			expect(ccFile.apiVersion).toBe("1.2")
			expect(ccFile.fileChecksum).toBe(expectedMD5)
		})

		it("should resolve a json string in version less than 1.3 and does not decorate checksum", () => {
			const ccFile = getCCFileAndDecorateFileChecksum('{"fileChecksum":"fake-checksum","apiVersion":"1.2"}')

			expect(ccFile.apiVersion).toBe("1.2")
			expect(ccFile.fileChecksum).toBe("fake-checksum")
		})

		it("should resolve a json object in version 1.3 and higher and decorate checksum", () => {
			const expectedMD5 = md5('{"apiVersion":"1.3"}')
			const ccFile = getCCFileAndDecorateFileChecksum({ checksum: "", data: { apiVersion: "1.3" } as ExportCCFile })

			expect(ccFile.apiVersion).toBe("1.3")
			expect(ccFile.fileChecksum).toBe(expectedMD5)
		})

		it("should resolve a json object in version 1.3 and higher and does not decorate checksum", () => {
			const ccFile = getCCFileAndDecorateFileChecksum({ checksum: "fake-checksum", data: { apiVersion: "1.3" } as ExportCCFile })

			expect(ccFile.apiVersion).toBe("1.3")
			expect(ccFile.fileChecksum).toBe("fake-checksum")
		})

		it("should resolve a json object in version less than 1.3 and decorate checksum", () => {
			const expectedMD5 = md5('{"apiVersion":"1.2"}')
			const ccFile = getCCFileAndDecorateFileChecksum({ apiVersion: "1.2" } as ExportCCFile)

			expect(ccFile.apiVersion).toBe("1.2")
			expect(ccFile.fileChecksum).toBe(expectedMD5)
		})

		it("should resolve a json object in version less than 1.2 and does not decorate checksum", () => {
			const ccFile = getCCFileAndDecorateFileChecksum({ fileChecksum: "fake-checksum", apiVersion: "1.2" } as ExportCCFile)

			expect(ccFile.apiVersion).toBe("1.2")
			expect(ccFile.fileChecksum).toBe("fake-checksum")
		})

		it("should return null on invalid input data", () => {
			const ccFile = getCCFileAndDecorateFileChecksum("broken json")

			expect(ccFile).toBeNull()
		})
	})
})
