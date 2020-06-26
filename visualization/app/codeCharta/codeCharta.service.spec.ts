import "./codeCharta.module"
import { CodeChartaService } from "./codeCharta.service"
import { getService, instantiateModule } from "../../mocks/ng.mockhelper"
import { TEST_FILE_CONTENT } from "./util/dataMocks"
import { CCFile, BlacklistType, NodeType } from "./codeCharta.model"
import _ from "lodash"
import { StoreService } from "./state/store.service"
import { resetFiles } from "./state/store/files/files.actions"
import { ExportBlacklistType, ExportCCFile } from "./codeCharta.api.model"
import { getCCFiles, isSingleState } from "./model/files/files.helper"

describe("codeChartaService", () => {
	let codeChartaService: CodeChartaService
	let storeService: StoreService
	let validFileContent: ExportCCFile
	const fileName: string = "someFileName"

	beforeEach(() => {
		restartSystem()
		rebuildService()
		validFileContent = _.cloneDeep(TEST_FILE_CONTENT)
		storeService.dispatch(resetFiles())
	})

	function restartSystem() {
		instantiateModule("app.codeCharta")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildService() {
		codeChartaService = new CodeChartaService(storeService)
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

		function letTestFail() {
			expect(true).toBeFalsy()
		}

		it("should load a file without edges", done => {
			validFileContent.edges = undefined

			codeChartaService
				.loadFiles([
					{
						fileName: fileName,
						content: validFileContent
					}
				])
				.then(() => {
					expect(getCCFiles(storeService.getState().files)[0]).toEqual(expected)
					expect(isSingleState(storeService.getState().files)).toBeTruthy()
					done()
				})
		})

		it("should resolve valid file", done => {
			codeChartaService
				.loadFiles([
					{
						fileName: fileName,
						content: validFileContent
					}
				])
				.then(() => {
					expect(getCCFiles(storeService.getState().files)[0]).toEqual(expected)
					expect(isSingleState(storeService.getState().files)).toBeTruthy()
					done()
				})
		})

		it("should reject null", done => {
			codeChartaService
				.loadFiles([{ fileName: fileName, content: null }])
				.then(() => {
					letTestFail()
				})
				.catch(err => {
					expect(err.error).toEqual(["file is empty or invalid"])
					expect(err.warning).toEqual([])
					done()
				})
		})

		it("should reject string", done => {
			codeChartaService
				.loadFiles([{ fileName: fileName, content: ("string" as any) as ExportCCFile }])
				.then(() => {
					letTestFail()
				})
				.catch(() => {
					done()
				})
		})

		it("should reject or catch invalid file", done => {
			const invalidFileContent = validFileContent
			delete invalidFileContent.projectName
			codeChartaService
				.loadFiles([{ fileName: fileName, content: invalidFileContent }])
				.then(() => {
					letTestFail()
				})
				.catch(err => {
					expect(err.error).toEqual(["file is empty or invalid"])
					expect(err.warning).toEqual([])
					done()
				})
		})

		it("should convert old blacklist type", done => {
			validFileContent.blacklist = [{ path: "foo", type: ExportBlacklistType.hide }]

			codeChartaService
				.loadFiles([
					{
						fileName: fileName,
						content: validFileContent
					}
				])
				.then(() => {
					const blacklist = [{ path: "foo", type: BlacklistType.flatten }]
					expect(getCCFiles(storeService.getState().files)[0].settings.fileSettings.blacklist).toEqual(blacklist)
					done()
				})
		})
	})
})
