import { ExportBlacklistType, ExportCCFile } from "../codeCharta.api.model"
import { AttributeTypeValue, BlacklistType, NameDataPair } from "../codeCharta.model"
import { getCCFile } from "./fileHelper"
import { TEST_FILE_CONTENT } from "./dataMocks"
import { clone } from "./clone"

describe("FileHelper", () => {
	let fileContent: ExportCCFile

	beforeEach(() => {
		fileContent = clone(TEST_FILE_CONTENT)
	})

	describe("getCCFile", () => {
		it("should build a CCFile", () => {
			const nameDataPair: NameDataPair = {content: fileContent, fileName: "fileName", fileSize: 30}
			const result = getCCFile(nameDataPair)

			expect(result).toMatchSnapshot()
		})

		it("should convert old blacklist type", () => {
			fileContent.blacklist = [{ path: "foo", type: ExportBlacklistType.hide }]

			const nameDataPair: NameDataPair = {content: fileContent, fileName: "fileName", fileSize: 30}
			const result = getCCFile(nameDataPair)

			expect(result.settings.fileSettings.blacklist).toEqual([{ path: "foo", type: BlacklistType.flatten }])
		})

		it("should ignore old attribute types", () => {
			fileContent.attributeTypes = {
				nodes: [{ mcc: AttributeTypeValue.absolute }],
				edges: [{ pairingRate: AttributeTypeValue.relative }]
			}

			const nameDataPair: NameDataPair = {content: fileContent, fileName: "fileName", fileSize: 30}
			const result = getCCFile(nameDataPair)

			expect(result.settings.fileSettings.attributeTypes).toEqual({ nodes: {}, edges: {} })
		})

		it("should return empty attributeTypes", () => {
			fileContent.attributeTypes = {}

			const nameDataPair: NameDataPair = {content: fileContent, fileName: "fileName", fileSize: 30}
			const result = getCCFile(nameDataPair)

			expect(result.settings.fileSettings.attributeTypes).toEqual({ nodes: {}, edges: {} })
		})

		it("should return empty attributeTypes if the property doesn't exist", () => {
			fileContent.attributeTypes = undefined

			const nameDataPair: NameDataPair = {content: fileContent, fileName: "fileName", fileSize: 30}
			const result = getCCFile(nameDataPair)

			expect(result.settings.fileSettings.attributeTypes).toEqual({ nodes: {}, edges: {} })
		})
	})
})
