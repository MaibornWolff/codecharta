import "./codeCharta.module"

import { CodeChartaService } from "./codeCharta.service"
import { getService, instantiateModule } from "../../mocks/ng.mockhelper"
import { TEST_FILE_CONTENT } from "./util/dataMocks"
import { CCFile, BlacklistType, NodeType } from "./codeCharta.model"
import _ from "lodash"
import { StoreService } from "./state/store.service"
import { resetFiles } from "./state/store/files/files.actions"
import { DialogService } from "./ui/dialog/dialog.service"

describe("codeChartaService", () => {
	let codeChartaService: CodeChartaService
	let storeService: StoreService
	let dialogService: DialogService
	let validFileContent

	beforeEach(() => {
		restartSystem()
		rebuildService()
		validFileContent = _.cloneDeep(TEST_FILE_CONTENT)
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

	describe("loadFiles", () => {
		const expected: CCFile = {
			fileMeta: { apiVersion: "1.1", fileName: "noFileName", projectName: "Sample Map" },
			map: {
				attributes: {},
				children: [
					{
						attributes: { functions: 10, mcc: 1, rloc: 100 },
						link: "http://www.google.de",
						name: "big leaf",
						path: "/root/big leaf",
						type: NodeType.FILE
					},
					{
						attributes: {},
						children: [
							{
								attributes: { functions: 100, mcc: 100, rloc: 30 },
								name: "small leaf",
								path: "/root/Parent Leaf/small leaf",
								type: NodeType.FILE
							},
							{
								attributes: { functions: 1000, mcc: 10, rloc: 70 },
								name: "other small leaf",
								path: "/root/Parent Leaf/other small leaf",
								type: NodeType.FILE
							}
						],
						name: "Parent Leaf",
						path: "/root/Parent Leaf",
						type: NodeType.FOLDER
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
						fileName: validFileContent.fileName,
						content: validFileContent
					}
				])
				.then(() => {
					expect(storeService.getState().files.getCCFiles()[0]).toEqual(expected)
					expect(storeService.getState().files.isSingleState()).toBeTruthy()
					done()
				})
		})

		it("should resolve valid file", done => {
			codeChartaService
				.loadFiles([
					{
						fileName: validFileContent.fileName,
						content: validFileContent
					}
				])
				.then(() => {
					expect(storeService.getState().files.getCCFiles()[0]).toEqual(expected)
					expect(storeService.getState().files.isSingleState()).toBeTruthy()
					done()
				})
		})

		it("should reject null", done => {
			codeChartaService
				.loadFiles([{ fileName: validFileContent.fileName, content: null }])
				.then(() => {
					letTestFail()
				})
				.catch(err => {
					expect(err).toEqual(['<i class="fa fa-exclamation-circle"></i>' + " file is empty or invalid"])
					done()
				})
		})

		it("should reject string", done => {
			codeChartaService
				.loadFiles([{ fileName: validFileContent.fileName, content: "string" }])
				.then(() => {
					letTestFail()
				})
				.catch(() => {
					done()
				})
		})

		it("should reject or catch invalid file", done => {
			let invalidFileContent = validFileContent
			delete invalidFileContent.projectName
			codeChartaService
				.loadFiles([{ fileName: validFileContent.fileName, content: null }])
				.then(() => {
					letTestFail()
				})
				.catch(err => {
					expect(err).toEqual(['<i class="fa fa-exclamation-circle"></i>' + " file is empty or invalid"])
					done()
				})
		})

		it("should convert old blacklist type", done => {
			validFileContent.blacklist = [{ path: "foo", type: "hide" }]

			codeChartaService
				.loadFiles([
					{
						fileName: validFileContent.fileName,
						content: validFileContent
					}
				])
				.then(() => {
					const blacklist = [{ path: "foo", type: BlacklistType.flatten }]
					expect(storeService.getState().files.getCCFiles()[0].settings.fileSettings.blacklist).toEqual(blacklist)
					done()
				})
		})
	})
})
