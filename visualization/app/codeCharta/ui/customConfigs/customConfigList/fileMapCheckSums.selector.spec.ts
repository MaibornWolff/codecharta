import { _mapCheckSumsByMapSelectionMode } from "./fileMapCheckSums.selector"
import { CCFile } from "../../../codeCharta.model"
import { FileSelectionState, FileState } from "../../../model/files/files"
import { Store } from "../../../state/store/store"

describe("fileMapCheckSumsSelector", () => {
	beforeEach(() => {
		Store["initialize"]()
	})

	it("should create a map with current file selection mode 'MULTIPLE' and file map checksum of visible files", () => {
		const ccFile = {
			map: {},
			settings: { fileSettings: {} },
			fileMeta: { fileChecksum: "123" }
		} as CCFile
		const visibleFileState: FileState = { file: ccFile, selectedAs: FileSelectionState.Partial }

		const mapCheckSumsByMapSelectionMode = _mapCheckSumsByMapSelectionMode([visibleFileState])
		expect(mapCheckSumsByMapSelectionMode).toEqual(new Map([["MULTIPLE", ["123"]]]))
	})

	it("should create a map with current file selection mode 'DELTA' and file map checksum of visible files", () => {
		const ccFile = {
			map: {},
			settings: { fileSettings: {} },
			fileMeta: { fileChecksum: "123" }
		} as CCFile
		const visibleFileStateReference: FileState = { file: ccFile, selectedAs: FileSelectionState.Reference }
		const visibleFileStateComparison: FileState = { file: ccFile, selectedAs: FileSelectionState.Comparison }

		const mapCheckSumsByMapSelectionMode = _mapCheckSumsByMapSelectionMode([visibleFileStateReference, visibleFileStateComparison])
		expect(mapCheckSumsByMapSelectionMode).toEqual(new Map([["DELTA", ["123", "123"]]]))
	})
})
