import { ExportBlacklistType, ExportCCFile } from "../codeCharta.api.model"
import { AttributeTypeValue, BlacklistType } from "../codeCharta.model"
import { getCCFile } from "./fileHelper"
import { TEST_FILE_CONTENT } from "./dataMocks"
const clone = require("rfdc")()

describe("FileHelper", () => {
	let fileContent: ExportCCFile

	beforeEach(() => {
		fileContent = clone(TEST_FILE_CONTENT)
	})

	describe("getCCFile", () => {
		it("should build a CCFile", () => {
			const result = getCCFile("fileName", fileContent)

			expect(result).toMatchSnapshot()
		})

		it("should convert old blacklist type", () => {
			fileContent.blacklist = [{ path: "foo", type: ExportBlacklistType.hide }]

			const result = getCCFile("fileName", fileContent)

			expect(result.settings.fileSettings.blacklist).toEqual([{ path: "foo", type: BlacklistType.flatten }])
		})

		it("should ignore old attribute types", () => {
			fileContent.attributeTypes = {
				nodes: [{ mcc: AttributeTypeValue.absolute }],
				edges: [{ pairingRate: AttributeTypeValue.relative }]
			}

			const result = getCCFile("fileName", fileContent)

			expect(result.settings.fileSettings.attributeTypes).toEqual({ nodes: {}, edges: {} })
		})
	})
})
