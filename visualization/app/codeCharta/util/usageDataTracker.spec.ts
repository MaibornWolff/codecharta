import { CCFile, CodeMapNode, NodeType, State } from "../codeCharta.model"
import { trackEventUsageData, TRACKING_DATA_LOCAL_STORAGE_ELEMENT, trackMapMetaData } from "./usageDataTracker"
import * as FilesHelper from "../model/files/files.helper"
import { FileState } from "../model/files/files"
import { APIVersions } from "../codeCharta.api.model"
import { HeightMetricActions } from "../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { klona } from "klona"

describe("UsageDataTracker", () => {
	// provide some default state properties
	const stateStub = {
		appSettings: {
			experimentalFeaturesEnabled: true,
			showMetricLabelNameValue: undefined,
			isWhiteBackground: false
		},
		dynamicSettings: {},
		fileSettings: {}
	} as State

	let singleFileState: FileState

	beforeEach(() => {
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

	function mockTrackingToBeAllowed() {
		jest.spyOn(FilesHelper, "isPartialState").mockReturnValue(true)
		jest.spyOn(FilesHelper, "getVisibleFileStates").mockReturnValue([singleFileState])
	}

	describe("trackMetaUsageData", () => {
		beforeEach(() => {
			jest.spyOn(window.localStorage.__proto__, "setItem")
			window.localStorage.__proto__.setItem = jest.fn()
		})
		it("should not track in multi/delta mode or for more than one uploaded file", () => {
			jest.spyOn(FilesHelper, "isPartialState").mockReturnValue(false)
			jest.spyOn(FilesHelper, "getVisibleFileStates").mockReturnValue([{} as FileState])

			trackMapMetaData(stateStub.files)

			jest.spyOn(FilesHelper, "isPartialState").mockReturnValue(true)
			jest.spyOn(FilesHelper, "getVisibleFileStates").mockReturnValue([{} as FileState, {} as FileState])

			trackMapMetaData(stateStub.files)

			expect(localStorage.setItem).not.toHaveBeenCalled()
		})

		it("should not track maps from old API versions", () => {
			singleFileState.file.fileMeta.apiVersion = APIVersions.ZERO_POINT_ONE
			mockTrackingToBeAllowed()
			trackMapMetaData(stateStub.files)

			singleFileState.file.fileMeta.apiVersion = "0.9"
			trackMapMetaData(stateStub.files)

			expect(localStorage.setItem).not.toHaveBeenCalled()
		})

		it("should track from API version 1.0", () => {
			singleFileState.file.map = { path: "/root" } as CodeMapNode

			mockTrackingToBeAllowed()
			trackMapMetaData(stateStub.files)

			singleFileState.file.fileMeta.apiVersion = "1.0"
			trackMapMetaData(stateStub.files)

			singleFileState.file.fileMeta.apiVersion = "2.0"
			trackMapMetaData(stateStub.files)

			expect(localStorage.setItem).toHaveBeenCalledTimes(3)
		})

		it("should track files with multiple programming languages properly", () => {
			singleFileState.file.map = mapStub

			assertMetaDataSnapshot()
		})

		it("should not consider files with divergent metrics for statistic calculation", () => {
			const mapStubDivergentMetrics = klona(mapStub)
			mapStubDivergentMetrics.children[1].attributes = { rloc: 0 }
			singleFileState.file.map = mapStubDivergentMetrics

			assertMetaDataSnapshot()
		})

		function assertMetaDataSnapshot() {
			mockTrackingToBeAllowed()
			jest.spyOn(Date, "now").mockReturnValue(1_612_369_999_999)

			jest.spyOn(window.localStorage.__proto__, "setItem")
			window.localStorage.__proto__.setItem = jest.fn().mockImplementation((_, value) => {
				expect(value).toMatchSnapshot()
			})

			trackMapMetaData(stateStub.files)

			expect(localStorage.setItem).toHaveBeenCalledTimes(1)
		}
	})

	describe("trackEventUsageData", () => {
		beforeEach(() => {
			jest.restoreAllMocks()

			jest.spyOn(FilesHelper, "isPartialState").mockReturnValue(true)
			jest.spyOn(FilesHelper, "getVisibleFileStates").mockReturnValue([singleFileState])
			jest.spyOn(Date, "now").mockReturnValue(1_612_428_357_566)

			jest.spyOn(window.localStorage.__proto__, "getItem")
			jest.spyOn(window.localStorage.__proto__, "setItem")
			window.localStorage.__proto__.getItem = jest.fn().mockReturnValue("some-already-tracked-events-from-file-storage")
			window.localStorage.__proto__.setItem = jest.fn().mockImplementation((_, value) => {
				expect(value).toMatchSnapshot()
			})
		})

		function expectEventHasBeenTracked() {
			expect(FilesHelper.getVisibleFileStates).toHaveBeenCalledTimes(3)
			expect(localStorage.getItem).toHaveBeenCalledWith(`${TRACKING_DATA_LOCAL_STORAGE_ELEMENT}/invalid-md5-sample-checksum-events`)
			expect(localStorage.setItem).toHaveBeenCalledTimes(1)
		}

		it("should not track when tracking is not allowed", () => {
			jest.spyOn(FilesHelper, "getVisibleFileStates").mockReturnValue([singleFileState, singleFileState])

			trackEventUsageData(HeightMetricActions.SET_HEIGHT_METRIC, stateStub.files, "newHeightMetricValue")

			// A second call would indicate that the tracking has not been cancelled as expected
			expect(FilesHelper.getVisibleFileStates).toHaveBeenCalledTimes(1)
		})

		it("should track an event", () => {
			trackEventUsageData(HeightMetricActions.SET_HEIGHT_METRIC, stateStub.files, "newHeightMetricValue")
			expectEventHasBeenTracked()
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
