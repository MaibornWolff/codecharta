import { FileSelectionState, FileState } from "../../model/files/files"
import { CCFile } from "../../codeCharta.model"
import { CustomViewFileStateConnector } from "./customViewFileStateConnector"
import { CustomViewMapSelectionMode } from "../../model/customView/customView.api.model"

describe("CustomViewFileStateConnector", () => {
	describe("getJointMapName", () => {
		it("should filter .cc.json with selection mode NONE", () => {
			const file1 = { fileMeta: { fileName: "none.cc.json" } } as CCFile
			const fileState1 = { file: file1, selectedAs: FileSelectionState.None } as FileState

			const fileState: FileState[] = []
			fileState.push(fileState1)

			const customViewFileStateConnector = new CustomViewFileStateConnector(fileState)

			expect(customViewFileStateConnector.getJointMapName()).toBe("")
		})

		it("should join .cc.json file names properly", () => {
			const fileSingle = { fileMeta: { fileName: "SINGLE.cc.json" }, map: { name: "test1" } } as CCFile
			const fileStateSingle = { file: fileSingle, selectedAs: FileSelectionState.Single } as FileState

			const fileMultiple = { fileMeta: { fileName: "MULTIPLE.cc.json" }, map: { name: "test2" } } as CCFile
			const fileStateMultiple = { file: fileMultiple, selectedAs: FileSelectionState.Partial } as FileState

			const fileDeltaWithoutFileExtension = { fileMeta: { fileName: "DELTA" }, map: { name: "test3" } } as CCFile
			const fileStateDelta = {
				file: fileDeltaWithoutFileExtension,
				selectedAs: FileSelectionState.Reference
			} as FileState

			const fileState: FileState[] = []
			fileState.push(fileStateSingle)
			fileState.push(fileStateMultiple)
			fileState.push(fileStateDelta)

			const customViewFileStateConnector = new CustomViewFileStateConnector(fileState)

			expect(customViewFileStateConnector.getSelectedMaps().length).toBe(3)
			expect(customViewFileStateConnector.getJointMapName()).toBe("SINGLE.cc.json MULTIPLE.cc.json DELTA")
		})
	})

	describe("set/is/getMapSelectionMode", () => {
		it("should set SINGLE mode as default", () => {
			const file1 = { fileMeta: { fileName: "none.cc.json" } } as CCFile
			const fileState1 = { file: file1, selectedAs: FileSelectionState.None } as FileState

			const fileState: FileState[] = []
			fileState.push(fileState1)

			const customViewFileStateConnector = new CustomViewFileStateConnector(fileState)

			expect(customViewFileStateConnector.getMapSelectionMode()).toBe(CustomViewMapSelectionMode.SINGLE)
		})

		it("should set map selection mode MULTIPLE on first partial file", () => {
			const fileSingle = { fileMeta: { fileName: "MULTIPLE.cc.json" }, map: { name: "test1" } } as CCFile
			const fileStateSingle = { file: fileSingle, selectedAs: FileSelectionState.Partial } as FileState

			const fileState: FileState[] = []
			fileState.push(fileStateSingle)

			const customViewFileStateConnector = new CustomViewFileStateConnector(fileState)

			expect(customViewFileStateConnector.getMapSelectionMode()).toBe(CustomViewMapSelectionMode.MULTIPLE)
		})

		it("should set map selection mode DELTA, if reference file is present", () => {
			const fileSingle = { fileMeta: { fileName: "REFERENCE.cc.json" }, map: { name: "test1" } } as CCFile
			const fileStateSingle = { file: fileSingle, selectedAs: FileSelectionState.Reference } as FileState

			const fileState: FileState[] = []
			fileState.push(fileStateSingle)

			const customViewFileStateConnector = new CustomViewFileStateConnector(fileState)

			expect(customViewFileStateConnector.getMapSelectionMode()).toBe(CustomViewMapSelectionMode.DELTA)
		})

		it("should set map selection mode DELTA, if comparison file is present", () => {
			const fileSingle = { fileMeta: { fileName: "REFERENCE.cc.json" }, map: { name: "test1" } } as CCFile
			const fileStateSingle = { file: fileSingle, selectedAs: FileSelectionState.Comparison } as FileState

			const fileState: FileState[] = []
			fileState.push(fileStateSingle)

			const customViewFileStateConnector = new CustomViewFileStateConnector(fileState)

			expect(customViewFileStateConnector.getMapSelectionMode()).toBe(CustomViewMapSelectionMode.DELTA)
		})
	})

	describe("getChecksumOfAssignedMaps", () => {
		it("should set SINGLE mode as default", () => {
			const expectedMap1Md5 = "07cdac95b6bceaf7857a377fc7695ffb"
			const file1 = { fileMeta: { fileName: "file1.cc.json", fileChecksum: expectedMap1Md5 }, map: { name: "test1" } } as CCFile
			const fileState1 = { file: file1, selectedAs: FileSelectionState.Single } as FileState

			const expectedMap2Md5 = "1846794e811d79ad212ff6eec9f8c9d1"
			const file2 = { fileMeta: { fileName: "file2.cc.json", fileChecksum: expectedMap2Md5 }, map: { name: "test2" } } as CCFile
			const fileState2 = { file: file2, selectedAs: FileSelectionState.Single } as FileState

			const fileState: FileState[] = []
			fileState.push(fileState1)
			fileState.push(fileState2)

			const customViewFileStateConnector = new CustomViewFileStateConnector(fileState)

			expect(customViewFileStateConnector.getChecksumOfAssignedMaps()).toBe(`${expectedMap1Md5};${expectedMap2Md5}`)
		})
	})
})
