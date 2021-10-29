import {
	TEST_FILE_CONTENT,
	TEST_FILE_CONTENT_INVALID_API,
	TEST_FILE_CONTENT_INVALID_MAJOR_API,
	TEST_FILE_CONTENT_INVALID_MINOR_API,
	TEST_FILE_CONTENT_NO_API
} from "./dataMocks"
import { CodeMapNode, NameDataPair, NodeType } from "../codeCharta.model"
import packageJson from "../../../package.json"
import { CCValidationResult, ERROR_MESSAGES, validate } from "./fileValidator"
import assert from "assert"
import { fileWithFixedFolders, fileWithFixedOverlappingSubFolders } from "../resources/fixed-folders/fixed-folders-example"
import { APIVersions, ExportCCFile } from "../codeCharta.api.model"
import { clone } from "./clone"
import { getService } from "../../../mocks/ng.mockhelper"
import { StoreService } from "../state/store.service"
import { IRootScopeService } from "angular"

describe("FileValidator", () => {
	let file: ExportCCFile
	let storeService: StoreService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildService()
		file = clone(TEST_FILE_CONTENT)
	})

	function restartSystem() {
		$rootScope = getService<IRootScopeService>("$rootScope")
	}

	function rebuildService() {
		storeService = new StoreService($rootScope)
	}

	it("API version exists in package.json", () => {
		expect(packageJson.codecharta.apiVersion).toEqual("1.3")
	})

	it("should throw on null", () => {
		const expectedError: CCValidationResult = {
			error: [ERROR_MESSAGES.fileIsInvalid],
			warning: []
		}

		assert.throws(() => {
			validate(null, storeService)
		}, expectedError)
	})

	it("should throw when higher Major API", () => {
		const nameDataPair: NameDataPair = {
			fileName: "fileName",
			fileSize: 30,
			content: TEST_FILE_CONTENT_INVALID_MAJOR_API
		}

		const expectedError: CCValidationResult = {
			error: [ERROR_MESSAGES.majorApiVersionIsOutdated],
			warning: []
		}

		assert.throws(() => {
			validate(nameDataPair, storeService)
		}, expectedError)
	})

	it("should throw on warning with higher minor API version", () => {
		const nameDataPair: NameDataPair = {
			fileName: "fileName",
			fileSize: 30,
			content: TEST_FILE_CONTENT_INVALID_MINOR_API
		}

		const expectedError: CCValidationResult = {
			error: [],
			warning: [`${ERROR_MESSAGES.minorApiVersionOutdated} Found: ${nameDataPair.content.apiVersion}`]
		}

		assert.throws(() => {
			validate(nameDataPair, storeService)
		}, expectedError)
	})

	it("should throw on file missing API version", () => {
		const nameDataPair: NameDataPair = {
			fileName: "fileName",
			fileSize: 30,
			content: TEST_FILE_CONTENT_NO_API
		}

		const expectedError: CCValidationResult = {
			error: [ERROR_MESSAGES.apiVersionIsInvalid],
			warning: []
		}

		assert.throws(() => {
			validate(nameDataPair, storeService)
		}, expectedError)
	})

	it("should throw on file with wrong API version", () => {
		const nameDataPair: NameDataPair = {
			fileName: "fileName",
			fileSize: 30,
			content: TEST_FILE_CONTENT_INVALID_API
		}

		const expectedError: CCValidationResult = {
			error: [ERROR_MESSAGES.apiVersionIsInvalid],
			warning: []
		}

		assert.throws(() => {
			validate(nameDataPair, storeService)
		}, expectedError)
	})

	it("should not throw on a file with edges", () => {
		file.edges = [
			{
				fromNodeName: "a",
				toNodeName: "b",
				attributes: {
					avgCommits: 42,
					pairingRate: 80
				}
			}
		]

		const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }

		validate(nameDataPair, storeService)
	})

	it("should not throw on a file without edges", () => {
		file.edges = undefined

		const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }

		validate(nameDataPair, storeService)
	})

	it("should not throw on a file when numbers are floating point values", () => {
		file.nodes[0].children[0].attributes["rloc"] = 333.4

		const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }

		validate(nameDataPair, storeService)
	})

	it("should throw when children are not unique in name+type", () => {
		file.nodes[0].children[0].name = "same"
		file.nodes[0].children[0].type = NodeType.FILE
		file.nodes[0].children[1].name = "same"
		file.nodes[0].children[1].type = NodeType.FILE
		const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }

		const expectedError: CCValidationResult = {
			error: [`${ERROR_MESSAGES.nodesNotUnique} Found duplicate of File with path: /root/same`],
			warning: []
		}

		assert.throws(() => {
			validate(nameDataPair, storeService)
		}, expectedError)
	})

	it("should throw when nodes are empty", () => {
		file.nodes = []

		const nameDataPair: NameDataPair = { fileName: "", fileSize: 30, content: file }

		const expectedError: CCValidationResult = {
			error: [ERROR_MESSAGES.nodesEmpty],
			warning: []
		}

		assert.throws(() => {
			validate(nameDataPair, storeService)
		}, expectedError)
	})

	it("should throw if nodes is not a node and therefore has no name or id", () => {
		file.nodes[0] = {
			// @ts-expect-error
			something: "something"
		}

		const nameDataPair: NameDataPair = { fileName: "", fileSize: 30, content: file }

		const expectedError: CCValidationResult = {
			error: [
				"Required error: nodes[0] should have required property 'name'",
				"Required error: nodes[0] should have required property 'type'"
			],
			warning: []
		}

		assert.throws(() => {
			validate(nameDataPair, storeService)
		}, expectedError)
	})

	describe("fixed sub folders validation", () => {
		it("should throw an error, if two sub folders horizontally overlap", () => {
			file = clone(fileWithFixedOverlappingSubFolders)
			const folder1: CodeMapNode = file.nodes[0].children[0].children[0]
			const folder2: CodeMapNode = file.nodes[0].children[0].children[1]
			const nameDataPair: NameDataPair = { fileName: "", fileSize: 30, content: file }

			const expectedError: CCValidationResult = {
				error: [
					`${ERROR_MESSAGES.fixedFoldersOverlapped} Found: folder_1_1 ${JSON.stringify(
						folder1.fixedPosition
					)} and folder_1_2 ${JSON.stringify(folder2.fixedPosition)}`
				],
				warning: []
			}

			assert.throws(() => {
				validate(nameDataPair, storeService)
			}, expectedError)
		})
	})

	describe("fixed folders validation", () => {
		let folder1: CodeMapNode
		let folder2: CodeMapNode

		beforeEach(() => {
			file = clone(fileWithFixedFolders)
			;[folder1, folder2] = file.nodes[0].children
		})

		it("should throw an error, if there are fixed folders, but not every folder on root is fixed", () => {
			folder1.fixedPosition = undefined
			const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }
			const expectedError: CCValidationResult = {
				error: [`${ERROR_MESSAGES.notAllFoldersAreFixed} Found: folder_1`],
				warning: []
			}

			assert.throws(() => {
				validate(nameDataPair, storeService)
			}, expectedError)
		})

		it("should throw an error, if at least one fixed folder has a padding that is out of bounds", () => {
			folder1.fixedPosition.left = -5
			folder1.fixedPosition.width = 7
			const nameDataPair: NameDataPair = { fileName: "", fileSize: 30, content: file }

			const expectedError: CCValidationResult = {
				error: [`${ERROR_MESSAGES.fixedFoldersOutOfBounds} Found: folder_1 ${JSON.stringify(folder1.fixedPosition)}`],
				warning: []
			}

			assert.throws(() => {
				validate(nameDataPair, storeService)
			}, expectedError)
		})

		it("should throw an error, if at least one fixed folder has a width or height that is out of bounds", () => {
			folder1.fixedPosition.left = 10
			folder1.fixedPosition.width = -50
			const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }

			const expectedError: CCValidationResult = {
				error: [`${ERROR_MESSAGES.fixedFoldersOutOfBounds} Found: folder_1 ${JSON.stringify(folder1.fixedPosition)}`],
				warning: []
			}

			assert.throws(() => {
				validate(nameDataPair, storeService)
			}, expectedError)
		})

		it("should throw an error, if at least one fixed folder exceeds the maximum coordinate of 100", () => {
			folder1.fixedPosition.left = 99
			folder1.fixedPosition.width = 2
			const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }

			const expectedError: CCValidationResult = {
				error: [`${ERROR_MESSAGES.fixedFoldersOutOfBounds} Found: folder_1 ${JSON.stringify(folder1.fixedPosition)}`],
				warning: []
			}

			assert.throws(() => {
				validate(nameDataPair, storeService)
			}, expectedError)
		})

		it("should throw an error, if two folders horizontally overlap", () => {
			folder1.fixedPosition = {
				left: 0,
				top: 0,
				width: 10,
				height: 10
			}
			folder2.fixedPosition = {
				left: 5,
				top: 1,
				width: 10,
				height: 10
			}
			const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }

			const expectedError: CCValidationResult = {
				error: [
					`${ERROR_MESSAGES.fixedFoldersOverlapped} Found: folder_1 ${JSON.stringify(
						folder1.fixedPosition
					)} and folder_2 ${JSON.stringify(folder2.fixedPosition)}`
				],
				warning: []
			}

			assert.throws(() => {
				validate(nameDataPair, storeService)
			}, expectedError)
		})

		it("should throw an error, if two folders vertically overlap", () => {
			folder1.fixedPosition = {
				left: 0,
				top: 0,
				width: 10,
				height: 10
			}
			folder2.fixedPosition = {
				left: 0,
				top: 5,
				width: 10,
				height: 10
			}
			const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }

			const expectedError: CCValidationResult = {
				error: [
					`${ERROR_MESSAGES.fixedFoldersOverlapped} Found: folder_1 ${JSON.stringify(
						folder1.fixedPosition
					)} and folder_2 ${JSON.stringify(folder2.fixedPosition)}`
				],
				warning: []
			}

			assert.throws(() => {
				validate(nameDataPair, storeService)
			}, expectedError)
		})

		it("should throw an error, if a folder is placed inside another", () => {
			folder1.fixedPosition = {
				left: 0,
				top: 0,
				width: 10,
				height: 10
			}
			folder2.fixedPosition = {
				left: 1,
				top: 1,
				width: 1,
				height: 1
			}
			const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }

			const expectedError: CCValidationResult = {
				error: [
					`${ERROR_MESSAGES.fixedFoldersOverlapped} Found: folder_2 ${JSON.stringify(
						folder2.fixedPosition
					)} and folder_1 ${JSON.stringify(folder1.fixedPosition)}`
				],
				warning: []
			}

			assert.throws(() => {
				validate(nameDataPair, storeService)
			}, expectedError)
		})

		it("should throw an error, if a folder has the same boundaries as another", () => {
			folder1.fixedPosition = {
				left: 0,
				top: 0,
				width: 10,
				height: 10
			}
			folder2.fixedPosition = folder1.fixedPosition
			const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }

			const expectedError: CCValidationResult = {
				error: [
					`${ERROR_MESSAGES.fixedFoldersOverlapped} Found: folder_1 ${JSON.stringify(
						folder1.fixedPosition
					)} and folder_2 ${JSON.stringify(folder2.fixedPosition)}`
				],
				warning: []
			}

			assert.throws(() => {
				validate(nameDataPair, storeService)
			}, expectedError)
		})

		it("should throw an error, if the major api version is smaller and fixed folders were defined", () => {
			file.apiVersion = APIVersions.ZERO_POINT_ONE
			const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }

			const expectedError: CCValidationResult = {
				error: [`${ERROR_MESSAGES.fixedFoldersNotAllowed} Found: 0.1`],
				warning: []
			}

			assert.throws(() => {
				validate(nameDataPair, storeService)
			}, expectedError)
		})

		it("should throw an error, if the minor api version is smaller and fixed folders were defined", () => {
			file.apiVersion = APIVersions.ONE_POINT_ONE
			const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }

			const expectedError: CCValidationResult = {
				error: [`${ERROR_MESSAGES.fixedFoldersNotAllowed} Found: 1.1`],
				warning: []
			}

			assert.throws(() => {
				validate(nameDataPair, storeService)
			}, expectedError)
		})
	})
})
