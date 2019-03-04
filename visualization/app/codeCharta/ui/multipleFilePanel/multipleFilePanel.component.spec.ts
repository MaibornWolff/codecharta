import "./multipleFilePanel"

import { MultipleFilePanelController } from "./multipleFilePanel.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { DataService, DataModel } from "../../core/data/data.service"
import { SettingsService, SettingsServiceSubscriber, Settings } from "../../core/settings/settings.service"
import { MultipleFileService } from "../../core/multipleFile/multipleFile.service"
import { CodeMap } from "../../core/data/model/CodeMap"

describe("multipleFilePanelController", function() {
	let multipleFileServiceMock: MultipleFileService,
		settingsServiceMock: SettingsService,
		dataServiceMock: DataService,
		multipleFilePanelController: MultipleFilePanelController

	beforeEach(function() {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.multipleFilePanel")

		const SettingsServiceMock = jest.fn<SettingsService>(() => ({
			subscribe: jest.fn(),
			applySettings: jest.fn(),
			settings: {
				map: {
					nodes: null
				}
			}
		}))

		settingsServiceMock = new SettingsServiceMock()

		const DataServiceMock = jest.fn<DataService>(() => ({
			subscribe: jest.fn(),
			data: {
				revisions: []
			}
		}))

		dataServiceMock = new DataServiceMock()

		const MultipleFileServiceMock = jest.fn<MultipleFileService>(() => ({
			aggregateMaps: jest.fn(() => {
				return file1
			})
		}))

		multipleFileServiceMock = new MultipleFileServiceMock()
	}

	function rebuildController() {
		multipleFilePanelController = new MultipleFilePanelController(settingsServiceMock, dataServiceMock, multipleFileServiceMock)
	}

	afterEach(() => {
		jest.resetAllMocks()
	})

	const file1: CodeMap = {
		fileName: "file1",
		projectName: "Sample Project",
		nodes: {
			name: "root",
			type: "Folder",
			attributes: {},
			children: [
				{
					name: "big leaf",
					type: "File",
					attributes: { rloc: 100, functions: 10, mcc: 1 },
					link: "http://www.google.de"
				},
				{
					name: "Parent Leaf",
					type: "Folder",
					attributes: {},
					children: [
						{
							name: "other small leaf",
							type: "File",
							attributes: { rloc: 70, functions: 1000, mcc: 10 }
						}
					]
				}
			]
		}
	}

	const file2: CodeMap = {
		fileName: "file2",
		projectName: "Sample Project",
		nodes: {
			name: "root",
			type: "Folder",
			attributes: {},
			children: [
				{
					name: "big leaf",
					type: "File",
					attributes: { rloc: 200, functions: 20, mcc: 2 },
					link: "http://www.google.de"
				},
				{
					name: "Parent Leaf",
					type: "Folder",
					attributes: {},
					children: [
						{
							name: "small leaf",
							type: "File",
							attributes: { rloc: 60, functions: 200, mcc: 200 }
						}
					]
				}
			]
		}
	}

	describe("onMultipleChange", () => {
		it("should select maps to aggregate", () => {
			multipleFilePanelController.selectedMapIndices = [0, 1]
			multipleFilePanelController.revisions = [file1, file2]
			const expected = [file1, file2]

			multipleFilePanelController.onMultipleChange()

			expect(multipleFilePanelController.mapsToAggregate).toEqual(expected)
			expect(multipleFileServiceMock.aggregateMaps).toBeCalledWith(expected)
			expect(multipleFileServiceMock.aggregateMaps).toHaveBeenCalledTimes(1)
			expect(multipleFilePanelController.settings.map).toEqual(file1)
			expect(multipleFilePanelController.settings.blacklist).toEqual(file1.blacklist)
			expect(settingsServiceMock.applySettings).toBeCalledWith(multipleFilePanelController.settings)
			expect(settingsServiceMock.applySettings).toHaveBeenCalledTimes(1)
		})

		it("should select maps to aggregate", () => {
			multipleFilePanelController.selectedMapIndices = [1]
			multipleFilePanelController.revisions = [file1, file2]
			const expected = [file2]

			multipleFilePanelController.onMultipleChange()

			expect(multipleFilePanelController.mapsToAggregate).toEqual(expected)
			expect(multipleFileServiceMock.aggregateMaps).toBeCalledWith(expected)
			expect(multipleFileServiceMock.aggregateMaps).toHaveBeenCalledTimes(1)
			expect(multipleFilePanelController.settings.map).toEqual(file1)
			expect(multipleFilePanelController.settings.blacklist).toEqual(file1.blacklist)
			expect(settingsServiceMock.applySettings).toBeCalledWith(multipleFilePanelController.settings)
			expect(settingsServiceMock.applySettings).toHaveBeenCalledTimes(1)
		})
	})

	describe("onMultipleChange", () => {
		it("should select maps to aggregate", () => {
			multipleFilePanelController.selectedMapIndices = [0, 1]
			multipleFilePanelController.revisions = [file1, file2]
			const expected = [file1, file2]

			multipleFilePanelController.onMultipleChange()

			expect(multipleFilePanelController.mapsToAggregate).toEqual(expected)
			expect(multipleFileServiceMock.aggregateMaps).toBeCalledWith(expected)
			expect(multipleFileServiceMock.aggregateMaps).toHaveBeenCalledTimes(1)
			expect(multipleFilePanelController.settings.map).toEqual(file1)
			expect(multipleFilePanelController.settings.blacklist).toEqual(file1.blacklist)
			expect(settingsServiceMock.applySettings).toBeCalledWith(multipleFilePanelController.settings)
			expect(settingsServiceMock.applySettings).toHaveBeenCalledTimes(1)
		})
	})

	describe("onSettingsChange", () => {
		it("should set settings", () => {
			const settings: Settings = {
				areaMetric: "a",
				colorMetric: "b",
				heightMetric: "c"
			} as Settings

			multipleFilePanelController.onSettingsChanged(settings, null)

			expect(multipleFilePanelController.settings).toEqual(settings)
		})
	})

	describe("onDataChanged", () => {
		it("should set data", () => {
			const data = {
				revisions: [file1, file2]
			} as DataModel

			multipleFilePanelController.onDataChanged(data)

			expect(multipleFilePanelController.data).toEqual(data)
			expect(multipleFilePanelController.revisions).toEqual([file1, file2])
			expect(multipleFilePanelController.selectedMapIndices).toEqual([0, 1])
		})
	})

	describe("selectAllRevisions", () => {
		it("should select all Revisions", () => {
			multipleFilePanelController.revisions = [file1, file2]
			multipleFilePanelController.selectedMapIndices = []

			multipleFilePanelController.selectAllRevisions()

			expect(multipleFilePanelController.selectedMapIndices).toEqual([0, 1])
		})
	})

	describe("selectNoRevisions", () => {
		it("should unselect all Revisions", () => {
			multipleFilePanelController.revisions = [file1, file2, file1]
			multipleFilePanelController.selectedMapIndices = [1, 2]

			multipleFilePanelController.selectNoRevisions()

			expect(multipleFilePanelController.selectedMapIndices).toEqual([])
		})

		it("should unselect all Revisions", () => {
			multipleFilePanelController.revisions = [file1, file2]
			multipleFilePanelController.selectedMapIndices = [0, 1]

			multipleFilePanelController.selectNoRevisions()

			expect(multipleFilePanelController.selectedMapIndices).toEqual([])
		})
	})

	describe("invertRevisionSelection", () => {
		it("should invert all revision selections", () => {
			multipleFilePanelController.revisions = [file1, file2, file1]
			multipleFilePanelController.selectedMapIndices = [1]

			multipleFilePanelController.intertRevisionSelection()

			expect(multipleFilePanelController.selectedMapIndices).toEqual([0, 2])
		})
	})
})
