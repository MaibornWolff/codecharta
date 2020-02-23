import "./codeCharta.module"

import { CodeChartaService } from "./codeCharta.service"
import { getService, instantiateModule } from "../../mocks/ng.mockhelper"
import { FileStateService } from "./state/fileState.service"
import { TEST_FILE_CONTENT } from "./util/dataMocks"
import { CCFile, BlacklistType, NodeType } from "./codeCharta.model"
import _ from "lodash"

describe("codeChartaService", () => {
	let codeChartaService: CodeChartaService
	let validFileContent
	let fileStateService: FileStateService

	beforeEach(() => {
		restartSystem()
		rebuildService()
		validFileContent = _.cloneDeep(TEST_FILE_CONTENT)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta")
		fileStateService = getService<FileStateService>("fileStateService")
	}

	function rebuildService() {
		codeChartaService = new CodeChartaService(fileStateService)
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
			settings: { fileSettings: { attributeTypes: { nodes: [], edges: [] }, blacklist: [], edges: [], markedPackages: [] } }
		}

		beforeEach(() => {
			fileStateService.addFile = jest.fn()
			fileStateService.setSingle = jest.fn()
		})

		function letTestFail() {
			expect(true).toBeFalsy()
		}

		it("should load a file without edges", done => {
			validFileContent.edges = undefined

			codeChartaService.loadFiles([{ fileName: validFileContent.fileName, content: validFileContent }]).then(() => {
				expect(fileStateService.addFile).toHaveBeenCalledWith(expected)
				expect(fileStateService.setSingle).toHaveBeenCalled()
				done()
			})
		})

		it("should resolve valid file", done => {
			codeChartaService.loadFiles([{ fileName: validFileContent.fileName, content: validFileContent }]).then(() => {
				expect(fileStateService.addFile).toHaveBeenCalledWith(expected)
				expect(fileStateService.setSingle).toHaveBeenCalled()
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
					expect(err).toEqual([{ dataPath: "empty or invalid file", message: "file is empty or invalid" }])
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
					expect(err).toEqual([{ dataPath: "empty or invalid file", message: "file is empty or invalid" }])
					done()
				})
		})

		it("should convert old blacklist type", done => {
			validFileContent.blacklist = [{ path: "foo", type: "hide" }]

			codeChartaService.loadFiles([{ fileName: validFileContent.fileName, content: validFileContent }]).then(() => {
				const expectedWithBlacklist = _.cloneDeep(expected)
				expectedWithBlacklist.settings.fileSettings.blacklist = [{ path: "foo", type: BlacklistType.flatten }]
				expect(fileStateService.addFile).toHaveBeenLastCalledWith(expectedWithBlacklist)
				done()
			})
		})
	})
})
