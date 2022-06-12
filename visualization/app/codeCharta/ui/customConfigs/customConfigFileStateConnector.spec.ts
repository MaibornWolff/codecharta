import { FileSelectionState, FileState } from "../../model/files/files"
import { CCFile } from "../../codeCharta.model"
import { CustomConfigFileStateConnector } from "./customConfigFileStateConnector"
import { CustomConfigMapSelectionMode } from "../../model/customConfig/customConfig.api.model"

describe("CustomConfigFileStateConnector", () => {
	describe("getJointMapName", () => {
		it("should filter .cc.json with selection mode NONE", () => {
			const file1 = { fileMeta: { fileName: "none.cc.json" } } as CCFile
			const fileState1 = { file: file1, selectedAs: FileSelectionState.None } as FileState

			const fileState: FileState[] = []
			fileState.push(fileState1)

			const customConfigFileStateConnector = new CustomConfigFileStateConnector(fileState)

			expect(customConfigFileStateConnector.getJointMapName()).toBe("")
		})

		it("should join .cc.json file names properly", () => {
			const fileMultiple = { fileMeta: { fileName: "MULTIPLE.cc.json" }, map: { name: "test1" } } as CCFile
			const fileStateMultiple = { file: fileMultiple, selectedAs: FileSelectionState.Partial } as FileState

			const fileDeltaWithoutFileExtension = { fileMeta: { fileName: "DELTA" }, map: { name: "test2" } } as CCFile
			const fileStateDelta = {
				file: fileDeltaWithoutFileExtension,
				selectedAs: FileSelectionState.Reference
			} as FileState

			const fileState: FileState[] = [fileStateMultiple, fileStateDelta]

			const customConfigFileStateConnector = new CustomConfigFileStateConnector(fileState)

			expect(customConfigFileStateConnector.getSelectedMaps().length).toBe(2)
			expect(customConfigFileStateConnector.getJointMapName()).toBe("MULTIPLE.cc.json DELTA")
		})
	})

	describe("set/is/getMapSelectionMode", () => {
		it("should set SINGLE mode as default", () => {
			const file1 = { fileMeta: { fileName: "none.cc.json" } } as CCFile
			const fileState1 = { file: file1, selectedAs: FileSelectionState.None } as FileState

			const fileState: FileState[] = []
			fileState.push(fileState1)

			const customConfigFileStateConnector = new CustomConfigFileStateConnector(fileState)

			expect(customConfigFileStateConnector.getMapSelectionMode()).toBe(CustomConfigMapSelectionMode.SINGLE)
		})

		it("should set map selection mode MULTIPLE on first partial file", () => {
			const fileSingle = { fileMeta: { fileName: "MULTIPLE.cc.json" }, map: { name: "test1" } } as CCFile
			const fileStateSingle = { file: fileSingle, selectedAs: FileSelectionState.Partial } as FileState

			const fileState: FileState[] = []
			fileState.push(fileStateSingle)

			const customConfigFileStateConnector = new CustomConfigFileStateConnector(fileState)

			expect(customConfigFileStateConnector.getMapSelectionMode()).toBe(CustomConfigMapSelectionMode.MULTIPLE)
		})

		it("should set map selection mode DELTA, if reference file is present", () => {
			const fileSingle = { fileMeta: { fileName: "REFERENCE.cc.json" }, map: { name: "test1" } } as CCFile
			const fileStateSingle = { file: fileSingle, selectedAs: FileSelectionState.Reference } as FileState

			const fileState: FileState[] = []
			fileState.push(fileStateSingle)

			const customConfigFileStateConnector = new CustomConfigFileStateConnector(fileState)

			expect(customConfigFileStateConnector.getMapSelectionMode()).toBe(CustomConfigMapSelectionMode.DELTA)
		})

		it("should set map selection mode DELTA, if comparison file is present", () => {
			const fileSingle = { fileMeta: { fileName: "REFERENCE.cc.json" }, map: { name: "test1" } } as CCFile
			const fileStateSingle = { file: fileSingle, selectedAs: FileSelectionState.Comparison } as FileState

			const fileState: FileState[] = []
			fileState.push(fileStateSingle)

			const customConfigFileStateConnector = new CustomConfigFileStateConnector(fileState)

			expect(customConfigFileStateConnector.getMapSelectionMode()).toBe(CustomConfigMapSelectionMode.DELTA)
		})
	})

	describe("getChecksumOfAssignedMaps", () => {
		it("should set PARTIAL mode as default", () => {
			const expectedMap1Md5 = "07cdac95b6bceaf7857a377fc7695ffb"
			const file1 = { fileMeta: { fileName: "file1.cc.json", fileChecksum: expectedMap1Md5 }, map: { name: "test1" } } as CCFile
			const fileState1 = { file: file1, selectedAs: FileSelectionState.Partial } as FileState

			const expectedMap2Md5 = "1846794e811d79ad212ff6eec9f8c9d1"
			const file2 = { fileMeta: { fileName: "file2.cc.json", fileChecksum: expectedMap2Md5 }, map: { name: "test2" } } as CCFile
			const fileState2 = { file: file2, selectedAs: FileSelectionState.Partial } as FileState

			const fileState: FileState[] = [fileState1, fileState2]

			const customConfigFileStateConnector = new CustomConfigFileStateConnector(fileState)

			expect(customConfigFileStateConnector.getChecksumOfAssignedMaps()).toBe(`${expectedMap1Md5};${expectedMap2Md5}`)
		})
	})
})
