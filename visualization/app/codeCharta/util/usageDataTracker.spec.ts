import { CCFile, CodeMapNode, NodeType, State } from "../codeCharta.model"
import { trackMapMetaData } from "./usageDataTracker"
import * as EnvironmentDetector from "./envDetector"
import * as FilesHelper from "../model/files/files.helper"
import { FileState } from "../model/files/files"
import { APIVersions } from "../codeCharta.api.model"
import { CodeChartaStorage } from "./codeChartaStorage"
jest.mock("./codeChartaStorage")

describe("UsageDataTracker", () => {
	describe("trackMetaUsageData", () => {
		// provide some default state properties
		const stateStub = {
			appSettings: {
				experimentalFeaturesEnabled: true,
				showMetricLabelNameValue: undefined,
				isWhiteBackground: false,
				camera: { x: 1, y: 2, z: 3 }
			},
			dynamicSettings: {},
			fileSettings: {}
		} as State

		const setItemMock = jest.fn()
		CodeChartaStorage.prototype.setItem = setItemMock

		let singleFileState: FileState
		beforeEach(() => {
			jest.resetAllMocks()

			singleFileState = {
				file: {
					fileMeta: {
						fileChecksum: "invalid-md5-sample-checksum",
						apiVersion: APIVersions.ONE_POINT_ONE,
						exportedFileSize: 999
					},
					map: {}
				} as CCFile
			} as FileState
		})

		it("should not track in web version, in multi/delta mode or for more than one uploaded file", () => {
			jest.spyOn(EnvironmentDetector, "isStandalone").mockReturnValue(false)
			jest.spyOn(FilesHelper, "isSingleState").mockReturnValue(true)
			jest.spyOn(FilesHelper, "getVisibleFileStates").mockReturnValue([{} as FileState])

			trackMapMetaData(stateStub)

			jest.spyOn(EnvironmentDetector, "isStandalone").mockReturnValue(true)
			jest.spyOn(FilesHelper, "isSingleState").mockReturnValue(false)
			jest.spyOn(FilesHelper, "getVisibleFileStates").mockReturnValue([{} as FileState])

			trackMapMetaData(stateStub)

			jest.spyOn(EnvironmentDetector, "isStandalone").mockReturnValue(true)
			jest.spyOn(FilesHelper, "isSingleState").mockReturnValue(true)
			jest.spyOn(FilesHelper, "getVisibleFileStates").mockReturnValue([{} as FileState, {} as FileState])

			trackMapMetaData(stateStub)

			expect(setItemMock).not.toHaveBeenCalled()
		})

		it("should not track maps from old API versions", () => {
			singleFileState.file.fileMeta.apiVersion = APIVersions.ONE_POINT_ZERO

			jest.spyOn(EnvironmentDetector, "isStandalone").mockReturnValue(true)
			jest.spyOn(FilesHelper, "isSingleState").mockReturnValue(true)
			jest.spyOn(FilesHelper, "getVisibleFileStates").mockReturnValue([singleFileState])

			trackMapMetaData(stateStub)

			singleFileState.file.fileMeta.apiVersion = "0.2"
			jest.spyOn(FilesHelper, "getVisibleFileStates").mockReturnValue([singleFileState])

			trackMapMetaData(stateStub)

			expect(setItemMock).not.toHaveBeenCalled()
		})

		it("should track from API version 1.1", () => {
			singleFileState.file.map = { path: "/root" } as CodeMapNode

			jest.spyOn(EnvironmentDetector, "isStandalone").mockReturnValue(true)
			jest.spyOn(FilesHelper, "isSingleState").mockReturnValue(true)
			jest.spyOn(FilesHelper, "getVisibleFileStates").mockReturnValue([singleFileState])

			trackMapMetaData(stateStub)

			singleFileState.file.fileMeta.apiVersion = "1.2"
			jest.spyOn(FilesHelper, "getVisibleFileStates").mockReturnValue([singleFileState])

			trackMapMetaData(stateStub)

			singleFileState.file.fileMeta.apiVersion = "2.0"
			jest.spyOn(FilesHelper, "getVisibleFileStates").mockReturnValue([singleFileState])

			trackMapMetaData(stateStub)

			expect(setItemMock).toHaveBeenCalledTimes(3)
		})

		it("should track files with multiple programming languages properly", () => {
			singleFileState.file.map = mapStub

			jest.spyOn(EnvironmentDetector, "isStandalone").mockReturnValue(true)
			jest.spyOn(FilesHelper, "isSingleState").mockReturnValue(true)
			jest.spyOn(FilesHelper, "getVisibleFileStates").mockReturnValue([singleFileState])

			jest.spyOn(Date, "now").mockReturnValue(1612369999999)

			const expectSetItemSnapshot = (CodeChartaStorage.prototype.setItem = jest.fn().mockImplementation((_, value) => {
				expect(value).toMatchSnapshot()
			}))

			trackMapMetaData(stateStub)

			expect(expectSetItemSnapshot).toHaveBeenCalledTimes(1)
		})
	})

	const mapStub: CodeMapNode = {
		name: "root",
		attributes: {},
		type: NodeType.FOLDER,
		isExcluded: false,
		isFlattened: false,
		children: [
			{
				name: "doNotTrackInvalidFileWithMissingExtension",
				path: "/root/doNotTrackInvalidFileWithMissingExtension",
				type: NodeType.FILE,
				attributes: { rloc: 100, functions: 10, mcc: 1 },
				isExcluded: false,
				isFlattened: false,
				link: "http://www.google.de"
			},
			{
				name: "bigLeaf.ts",
				path: "/root/bigLeaf.ts",
				type: NodeType.FILE,
				attributes: { rloc: 100, functions: 10, mcc: 1 },
				isExcluded: false,
				isFlattened: false,
				link: "http://www.google.de"
			},
			{
				name: "bigLeaf.java",
				path: "/root/bigLeaf.java",
				type: NodeType.FILE,
				attributes: { rloc: 100, functions: 10, mcc: 1 },
				isExcluded: false,
				isFlattened: false,
				link: "http://www.google.de"
			},
			{
				name: "Parent Leaf",
				path: "/root/Parent Leaf",
				type: NodeType.FOLDER,
				attributes: {},
				isExcluded: false,
				isFlattened: false,
				children: [
					{
						name: "smallLeaf.ts",
						path: "/root/Parent Leaf/smallLeaf.ts",
						type: NodeType.FILE,
						attributes: { rloc: 30, functions: 100, mcc: 100 },
						isExcluded: false,
						isFlattened: false
					},
					{
						name: "otherLeaf.ts",
						path: "/root/Parent Leaf/otherLeaf.ts",
						type: NodeType.FILE,
						attributes: { rloc: 70, functions: 1000, mcc: 10 },
						isExcluded: false,
						isFlattened: false
					},
					{
						name: "smallLeaf.java",
						path: "/root/Parent Leaf/smallLeaf.java",
						type: NodeType.FILE,
						attributes: { rloc: 30, functions: 100, mcc: 100 },
						isExcluded: false,
						isFlattened: false
					},
					{
						name: "otherLeaf.java",
						path: "/root/Parent Leaf/otherLeaf.java",
						type: NodeType.FILE,
						attributes: { rloc: 70, functions: 1000, mcc: 10 },
						isExcluded: false,
						isFlattened: false
					},
					{
						name: "anotherLeaf.java",
						path: "/root/Parent Leaf/anotherLeaf.java",
						type: NodeType.FILE,
						attributes: { rloc: 20, functions: 10, mcc: 2 },
						isExcluded: false,
						isFlattened: false
					}
				]
			}
		]
	}
})
