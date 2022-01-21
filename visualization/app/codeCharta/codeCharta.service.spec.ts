import "./codeCharta.module"
import { CodeChartaService } from "./codeCharta.service"
import { getService, instantiateModule } from "../../mocks/ng.mockhelper"
import { TEST_FILE_CONTENT } from "./util/dataMocks"
import { BlacklistType, CCFile, NodeMetricData, NodeType } from "./codeCharta.model"
import { StoreService } from "./state/store.service"
import { removeFile, resetFiles } from "./state/store/files/files.actions"
import { ExportBlacklistType, ExportCCFile } from "./codeCharta.api.model"
import { getCCFiles, isPartialState } from "./model/files/files.helper"
import { DialogService } from "./ui/dialog/dialog.service"
import { CCFileValidationResult, ERROR_MESSAGES } from "./util/fileValidator"
import packageJson from "../../package.json"
import { clone } from "./util/clone"
import { nodeMetricDataSelector } from "./state/selectors/accumulatedData/metricData/nodeMetricData.selector"
import { klona } from "klona"

const mockedNodeMetricDataSelector = nodeMetricDataSelector as unknown as jest.Mock
jest.mock("./state/selectors/accumulatedData/metricData/nodeMetricData.selector", () => ({
	nodeMetricDataSelector: jest.fn()
}))

describe("codeChartaService", () => {
	let codeChartaService: CodeChartaService
	let storeService: StoreService
	let dialogService: DialogService
	let validFileContent: ExportCCFile
	let metricData: NodeMetricData[]
	const fileName = "someFileName"

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedDialogService()

		validFileContent = clone(TEST_FILE_CONTENT)

		metricData = clone([
			{ name: "mcc", maxValue: 1, minValue: 1 },
			{ name: "rloc", maxValue: 2, minValue: 1 }
		])
		storeService.dispatch(resetFiles())
	})

	function restartSystem() {
		instantiateModule("app.codeCharta")
		storeService = getService<StoreService>("storeService")
		dialogService = getService<DialogService>("dialogService")
	}

	function rebuildService() {
		codeChartaService = new CodeChartaService(storeService, dialogService)
	}

	function withMockedDialogService() {
		dialogService = codeChartaService["dialogService"] = jest.fn().mockReturnValue({
			showValidationDialog: jest.fn()
		})()
	}

	describe("loadFiles", () => {
		mockedNodeMetricDataSelector.mockImplementation(() => metricData)

		const expected: CCFile = {
			fileMeta: {
				apiVersion: packageJson.codecharta.apiVersion,
				fileName,
				projectName: "Sample Map",
				fileChecksum: "invalid-md5-sample",
				exportedFileSize: 42,
				repoCreationDate: ""
			},
			map: {
				attributes: {},
				isExcluded: false,
				isFlattened: false,
				children: [
					{
						attributes: { functions: 10, mcc: 1, rloc: 100 },
						link: "http://www.google.de",
						name: "big leaf",
						path: "/root/big leaf",
						type: NodeType.FILE,
						isExcluded: false,
						isFlattened: false
					},
					{
						attributes: {},
						children: [
							{
								attributes: { functions: 100, mcc: 100, rloc: 30 },
								name: "small leaf",
								path: "/root/Parent Leaf/small leaf",
								type: NodeType.FILE,
								isExcluded: false,
								isFlattened: false
							},
							{
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

		it("should load a file without edges", async () => {
			validFileContent.edges = undefined

			await codeChartaService.loadFiles([
				{
					fileName,
					content: validFileContent,
					fileSize: 42
				}
			])

			expect(getCCFiles(storeService.getState().files)[0]).toEqual(expected)
			expect(isPartialState(storeService.getState().files)).toBeTruthy()
		})

		it("should load a valid file and update root data", async () => {
			await codeChartaService.loadFiles([
				{
					fileName,
					content: validFileContent,
					fileSize: 42
				}
			])

			expect(getCCFiles(storeService.getState().files)[0]).toEqual(expected)
			expect(isPartialState(storeService.getState().files)).toBeTruthy()
			expect(dialogService.showValidationDialog).not.toHaveBeenCalled()

			expect(CodeChartaService.ROOT_NAME).toEqual(expected.map.name)
			expect(CodeChartaService.ROOT_PATH).toEqual(`/${expected.map.name}`)
		})

		it("should replace files with equal file name and checksum when loading new files", async () => {
			const valid2ndFileContent = klona(validFileContent)
			valid2ndFileContent.fileChecksum = "hash_1"

			await codeChartaService.loadFiles([{ fileName: "FirstFile", content: validFileContent, fileSize: 42 }])

			await codeChartaService.loadFiles([
				{ fileName: "FirstFile", content: validFileContent, fileSize: 42 },
				{ fileName: "SecondFile", content: valid2ndFileContent, fileSize: 42 }
			])

			const CCFilesUnderTest = getCCFiles(storeService.getState().files)

			expect(CCFilesUnderTest.length).toEqual(2)
			expect(CCFilesUnderTest[0].fileMeta.fileName).toEqual("FirstFile")
			expect(CCFilesUnderTest[0].fileMeta.fileChecksum).toEqual("invalid-md5-sample")
			expect(CCFilesUnderTest[1].fileMeta.fileName).toEqual("SecondFile")
			expect(CCFilesUnderTest[1].fileMeta.fileChecksum).toEqual("hash_1")
		})

		it("should load files with equal file name but different checksum and rename uploaded files ", async () => {
			const valid2ndFileContent = klona(validFileContent)
			valid2ndFileContent.fileChecksum = "hash_1"
			const valid3rdFileContent = klona(validFileContent)
			valid3rdFileContent.fileChecksum = "hash_2"

			await codeChartaService.loadFiles([{ fileName: "FirstFile", content: validFileContent, fileSize: 42 }])

			await codeChartaService.loadFiles([
				{ fileName: "FirstFile", content: valid2ndFileContent, fileSize: 42 },
				{ fileName: "FirstFile", content: valid3rdFileContent, fileSize: 42 }
			])

			const CCFilesUnderTest = getCCFiles(storeService.getState().files)

			expect(CCFilesUnderTest.length).toEqual(3)
			expect(CCFilesUnderTest[0].fileMeta.fileName).toEqual("FirstFile")
			expect(CCFilesUnderTest[0].fileMeta.fileChecksum).toEqual("invalid-md5-sample")
			expect(CCFilesUnderTest[1].fileMeta.fileName).toEqual("FirstFile_1")
			expect(CCFilesUnderTest[1].fileMeta.fileChecksum).toEqual("hash_1")
			expect(CCFilesUnderTest[2].fileMeta.fileName).toEqual("FirstFile_2")
			expect(CCFilesUnderTest[2].fileMeta.fileChecksum).toEqual("hash_2")
		})

		it("should not load files with equal file name and checksum when there was a renaming of file names in previous uploads", async () => {
			const valid2ndFileContent = klona(validFileContent)
			valid2ndFileContent.fileChecksum = "hash_1"
			const valid3rdFileContent = klona(validFileContent)
			valid3rdFileContent.fileChecksum = "hash_2"

			await codeChartaService.loadFiles([
				{ fileName: "FirstFile", content: validFileContent, fileSize: 42 },
				{ fileName: "FirstFile", content: valid2ndFileContent, fileSize: 42 }
			])

			await codeChartaService.loadFiles([
				{ fileName: "FirstFile", content: valid3rdFileContent, fileSize: 42 },
				{ fileName: "FirstFile", content: valid2ndFileContent, fileSize: 42 }
			])

			const CCFilesUnderTest = getCCFiles(storeService.getState().files)

			expect(CCFilesUnderTest.length).toEqual(3)
			expect(CCFilesUnderTest[0].fileMeta.fileName).toEqual("FirstFile")
			expect(CCFilesUnderTest[0].fileMeta.fileChecksum).toEqual("invalid-md5-sample")
			expect(CCFilesUnderTest[1].fileMeta.fileName).toEqual("FirstFile_1")
			expect(CCFilesUnderTest[1].fileMeta.fileChecksum).toEqual("hash_1")
			expect(CCFilesUnderTest[2].fileMeta.fileName).toEqual("FirstFile_2")
			expect(CCFilesUnderTest[2].fileMeta.fileChecksum).toEqual("hash_2")
		})

		it("should not load broken file but after fixing this problem manually it should possible to load this file again", async () => {
			const invalidFileContent = klona(validFileContent)
			invalidFileContent.apiVersion = ""

			await codeChartaService.loadFiles([{ fileName: "FirstFile", content: invalidFileContent, fileSize: 42 }])

			await codeChartaService.loadFiles([{ fileName: "FirstFile", content: validFileContent, fileSize: 42 }])

			const CCFilesUnderTest = getCCFiles(storeService.getState().files)

			expect(CCFilesUnderTest.length).toEqual(1)
			expect(CCFilesUnderTest[0].fileMeta.fileName).toEqual("FirstFile")
			expect(CCFilesUnderTest[0].fileMeta.fileChecksum).toEqual("invalid-md5-sample")
		})

		it("should select the newly added file", async () => {
			const valid2ndFileContent = klona(validFileContent)
			valid2ndFileContent.fileChecksum = "hash_1"

			await codeChartaService.loadFiles([{ fileName: "FirstFile", content: validFileContent, fileSize: 42 }])

			await codeChartaService.loadFiles([{ fileName: "SecondFile", content: valid2ndFileContent, fileSize: 42 }])

			expect(storeService.getState().files[0].selectedAs).toEqual("None")
			expect(storeService.getState().files[1].selectedAs).toEqual("Partial")
		})

		it("should load the default scenario after loading a valid file", async () => {
			await codeChartaService.loadFiles([
				{
					fileName,
					content: validFileContent,
					fileSize: 42
				}
			])

			expect(storeService.getState().dynamicSettings.areaMetric).toEqual("rloc")
			expect(storeService.getState().dynamicSettings.heightMetric).toEqual("mcc")
			expect(storeService.getState().dynamicSettings.colorMetric).toEqual("mcc")
		})

		it("should not load the default scenario after loading a valid file, that does not have the required metrics", async () => {
			metricData.pop()

			await codeChartaService.loadFiles([
				{
					fileName,
					content: validFileContent,
					fileSize: 42
				}
			])

			expect(storeService.getState().dynamicSettings.areaMetric).toBeNull()
			expect(storeService.getState().dynamicSettings.heightMetric).toBeNull()
			expect(storeService.getState().dynamicSettings.colorMetric).toBeNull()
		})

		it("should show error on invalid file", async () => {
			const expectedError: CCFileValidationResult[] = [
				{
					fileName,
					errors: [ERROR_MESSAGES.fileIsInvalid],
					warnings: []
				}
			]

			await codeChartaService.loadFiles([{ fileName, content: null, fileSize: 0 }])

			expect(storeService.getState().files).toHaveLength(0)
			expect(dialogService.showValidationDialog).toHaveBeenCalledWith(expectedError)
		})

		it("should show error on a random string", async () => {
			const expectedError: CCFileValidationResult[] = [
				{
					fileName,
					errors: [ERROR_MESSAGES.apiVersionIsInvalid],
					warnings: []
				}
			]

			await codeChartaService.loadFiles([{ fileName, fileSize: 42, content: "string" as unknown as ExportCCFile }])

			expect(storeService.getState().files).toHaveLength(0)
			expect(dialogService.showValidationDialog).toHaveBeenCalledWith(expectedError)
		})

		it("should show error if a file is missing a required property", async () => {
			const expectedError: CCFileValidationResult[] = [
				{
					fileName,
					errors: ["Required error:  should have required property 'projectName'"],
					warnings: []
				}
			]

			const invalidFileContent = validFileContent
			delete invalidFileContent.projectName
			await codeChartaService.loadFiles([{ fileName, fileSize: 42, content: invalidFileContent }])

			expect(storeService.getState().files).toHaveLength(0)
			expect(dialogService.showValidationDialog).toHaveBeenCalledWith(expectedError)
		})

		it("should convert old blacklist type", async () => {
			validFileContent.blacklist = [{ path: "foo", type: ExportBlacklistType.hide }]

			await codeChartaService.loadFiles([
				{
					fileName,
					content: validFileContent,
					fileSize: 42
				}
			])

			const blacklist = [{ path: "foo", type: BlacklistType.flatten }]
			expect(getCCFiles(storeService.getState().files)[0].settings.fileSettings.blacklist).toEqual(blacklist)
		})

		it("should not show a validation error if filenames are duplicated when their path is different", async () => {
			validFileContent.nodes[0].children[0].name = "duplicate"
			validFileContent.nodes[0].children[1].children[0].name = "duplicate"

			await codeChartaService.loadFiles([{ fileName, content: validFileContent, fileSize: 42 }])

			expect(dialogService.showValidationDialog).toHaveBeenCalledTimes(0)
			expect(storeService.getState().files).toHaveLength(1)
		})

		it("should show a validation error if two files in a folder have the same name", async () => {
			validFileContent.nodes[0].children[1].children[0].name = "duplicate"
			validFileContent.nodes[0].children[1].children[1].name = "duplicate"
			const expectedError: CCFileValidationResult[] = [
				{
					fileName,
					errors: [`${ERROR_MESSAGES.nodesNotUnique} Found duplicate of File with path: /root/Parent Leaf/duplicate`],
					warnings: []
				}
			]

			await codeChartaService.loadFiles([{ fileName, content: validFileContent, fileSize: 42 }])

			expect(dialogService.showValidationDialog).toHaveBeenCalledWith(expectedError)
		})

		it("should not show a validation error if two files in a folder have the same name but different type", async () => {
			validFileContent.nodes[0].children[1].children[0].name = "duplicate"
			validFileContent.nodes[0].children[1].children[0].type = NodeType.FILE
			validFileContent.nodes[0].children[1].children[1].name = "duplicate"
			validFileContent.nodes[0].children[1].children[1].type = NodeType.FOLDER

			await codeChartaService.loadFiles([{ fileName, content: validFileContent, fileSize: 42 }])

			expect(dialogService.showValidationDialog).toHaveBeenCalledTimes(0)
			expect(storeService.getState().files).toHaveLength(1)
		})

		it("should remove a file", async () => {
			await codeChartaService.loadFiles([
				{ fileName: "FirstFile", content: validFileContent, fileSize: 42 },
				{ fileName: "SecondFile", content: validFileContent, fileSize: 42 }
			])

			storeService.dispatch(removeFile("FirstFile"))
			expect(storeService.getState().files).toHaveLength(1)
			expect(storeService.getState().files[0].file.fileMeta.fileName).toEqual("SecondFile")
		})
	})
})
