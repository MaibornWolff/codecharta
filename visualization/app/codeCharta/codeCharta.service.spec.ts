import "./codeCharta.module"
import { CodeChartaService } from "./codeCharta.service"
import { getService, instantiateModule } from "../../mocks/ng.mockhelper"
import { TEST_FILE_CONTENT } from "./util/dataMocks"
import { BlacklistType, CCFile, MetricData, NodeType } from "./codeCharta.model"
import _ from "lodash"
import { StoreService } from "./state/store.service"
import { resetFiles } from "./state/store/files/files.actions"
import { ExportBlacklistType, ExportCCFile } from "./codeCharta.api.model"
import { getCCFiles, isSingleState } from "./model/files/files.helper"
import { DialogService } from "./ui/dialog/dialog.service"
import { MetricService } from "./state/metric.service"

describe("codeChartaService", () => {
	let codeChartaService: CodeChartaService
	let storeService: StoreService
	let dialogService: DialogService
	let metricService: MetricService
	let validFileContent: ExportCCFile
	let metricData: MetricData[]
	const fileName: string = "someFileName"

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedDialogService()

		validFileContent = _.cloneDeep(TEST_FILE_CONTENT)
		metricData = _.cloneDeep([
			{ name: "mcc", maxValue: 1 },
			{ name: "rloc", maxValue: 2 }
		])
		storeService.dispatch(resetFiles())
	})

	function restartSystem() {
		instantiateModule("app.codeCharta")
		storeService = getService<StoreService>("storeService")
		dialogService = getService<DialogService>("dialogService")
		metricService = getService<MetricService>("metricService")
	}

	function rebuildService() {
		codeChartaService = new CodeChartaService(storeService, dialogService, metricService)
	}

	function withMockedDialogService() {
		dialogService = codeChartaService["dialogService"] = jest.fn().mockReturnValue({
			showValidationErrorDialog: jest.fn(),
			showValidationWarningDialog: jest.fn()
		})()
	}

	describe("loadFiles", () => {
		const expected: CCFile = {
			fileMeta: { apiVersion: "1.1", fileName, projectName: "Sample Map" },
			map: {
				id: 0,
				attributes: {},
				isExcluded: false,
				isFlattened: false,
				children: [
					{
						id: 1,
						attributes: { functions: 10, mcc: 1, rloc: 100 },
						link: "http://www.google.de",
						name: "big leaf",
						path: "/root/big leaf",
						type: NodeType.FILE,
						isExcluded: false,
						isFlattened: false
					},
					{
						id: 2,
						attributes: {},
						children: [
							{
								id: 3,
								attributes: { functions: 100, mcc: 100, rloc: 30 },
								name: "small leaf",
								path: "/root/Parent Leaf/small leaf",
								type: NodeType.FILE,
								isExcluded: false,
								isFlattened: false
							},
							{
								id: 4,
								attributes: { functions: 1000, mcc: 10, rloc: 70 },
								name: "other small leaf",
								path: "/root/Parent Leaf/other small leaf",
								type: NodeType.FILE,
								isExcluded: false,
								isFlattened: false
							}
						],
						name: "Parent Leaf",
						path: "/root/Parent Leaf",
						type: NodeType.FOLDER,
						isExcluded: false,
						isFlattened: false
					}
				],
				name: "root",
				path: "/root",
				type: NodeType.FOLDER
			},
			settings: {
				fileSettings: {
					attributeTypes: { nodes: {}, edges: {} },
					blacklist: [],
					edges: [],
					markedPackages: []
				}
			}
		}

		it("should load a file without edges", () => {
			validFileContent.edges = undefined

			codeChartaService.loadFiles([
				{
					fileName,
					content: validFileContent
				}
			])

			expect(getCCFiles(storeService.getState().files)[0]).toEqual(expected)
			expect(isSingleState(storeService.getState().files)).toBeTruthy()
		})

		it("should load a valid file", () => {
			codeChartaService.loadFiles([
				{
					fileName,
					content: validFileContent
				}
			])

			expect(getCCFiles(storeService.getState().files)[0]).toEqual(expected)
			expect(isSingleState(storeService.getState().files)).toBeTruthy()
		})

		it("should load the default scenario after loading a valid file", () => {
			metricService["metricData"] = metricData

			codeChartaService.loadFiles([
				{
					fileName,
					content: validFileContent
				}
			])

			expect(storeService.getState().dynamicSettings.areaMetric).toEqual("rloc")
			expect(storeService.getState().dynamicSettings.heightMetric).toEqual("mcc")
			expect(storeService.getState().dynamicSettings.colorMetric).toEqual("mcc")
		})

		it("should not load the default scenario after loading a valid file, that does not have the required metrics", () => {
			metricData.pop()
			metricService["metricData"] = metricData

			codeChartaService.loadFiles([
				{
					fileName,
					content: validFileContent
				}
			])

			expect(storeService.getState().dynamicSettings.areaMetric).toBeNull()
			expect(storeService.getState().dynamicSettings.heightMetric).toBeNull()
			expect(storeService.getState().dynamicSettings.colorMetric).toBeNull()
		})

		it("should show error on invalid file", () => {
			codeChartaService.loadFiles([{ fileName, content: null }])

			expect(storeService.getState().files).toHaveLength(0)
			expect(dialogService.showValidationErrorDialog).toHaveBeenCalled()
		})

		it("should show error on a random string", () => {
			codeChartaService.loadFiles([{ fileName, content: ("string" as any) as ExportCCFile }])

			expect(storeService.getState().files).toHaveLength(0)
			expect(dialogService.showValidationErrorDialog).toHaveBeenCalled()
		})

		it("should show error if a file is missing a required property", () => {
			const invalidFileContent = validFileContent
			delete invalidFileContent.projectName
			codeChartaService.loadFiles([{ fileName, content: invalidFileContent }])

			expect(storeService.getState().files).toHaveLength(0)
			expect(dialogService.showValidationErrorDialog).toHaveBeenCalled()
		})

		it("should convert old blacklist type", () => {
			validFileContent.blacklist = [{ path: "foo", type: ExportBlacklistType.hide }]

			codeChartaService.loadFiles([
				{
					fileName,
					content: validFileContent
				}
			])

			const blacklist = [{ path: "foo", type: BlacklistType.flatten }]
			expect(getCCFiles(storeService.getState().files)[0].settings.fileSettings.blacklist).toEqual(blacklist)
		})
	})
})
