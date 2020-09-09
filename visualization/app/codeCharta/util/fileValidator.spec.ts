import {
	TEST_FILE_CONTENT,
	TEST_FILE_CONTENT_INVALID_API,
	TEST_FILE_CONTENT_INVALID_MAJOR_API,
	TEST_FILE_CONTENT_INVALID_MINOR_API,
	TEST_FILE_CONTENT_NO_API
} from "./dataMocks"
import { NodeType } from "../codeCharta.model"
import packageJson from "../../../package.json"
import { CCValidationResult, ERROR_MESSAGES, validate } from "./fileValidator"
import assert from "assert"
import { fileWithFixedFolders } from "../ressources/fixed-folders/fixed-folders-example"
import { ExportCCFile } from "../codeCharta.api.model"
import { clone } from "./clone"

describe("FileValidator", () => {
	let file: ExportCCFile
	let invalidFile

	beforeEach(() => {
		file = TEST_FILE_CONTENT
	})

	it("API version exists in package.json", () => {
		expect(packageJson.codecharta.apiVersion).toEqual("1.2")
	})

	it("should throw on null", () => {
		const expectedError: CCValidationResult = {
			title: ERROR_MESSAGES.fileIsInvalid.title,
			error: [ERROR_MESSAGES.fileIsInvalid.message],
			warning: []
		}

		assert.throws(() => {
			validate(null)
		}, expectedError)
	})

	it("should throw when higher Major API", () => {
		invalidFile = TEST_FILE_CONTENT_INVALID_MAJOR_API

		const expectedError: CCValidationResult = {
			title: ERROR_MESSAGES.majorApiVersionIsOutdated.title,
			error: [ERROR_MESSAGES.majorApiVersionIsOutdated.message],
			warning: []
		}

		assert.throws(() => {
			validate(invalidFile)
		}, expectedError)
	})

	it("should throw on warning with higher minor API version", () => {
		file = TEST_FILE_CONTENT_INVALID_MINOR_API

		const expectedError: CCValidationResult = {
			title: ERROR_MESSAGES.minorApiVersionOutdated.title,
			error: [],
			warning: [ERROR_MESSAGES.minorApiVersionOutdated.message]
		}

		assert.throws(() => {
			validate(file)
		}, expectedError)
	})

	it("should throw on file missing API version", () => {
		invalidFile = TEST_FILE_CONTENT_NO_API

		const expectedError: CCValidationResult = {
			title: ERROR_MESSAGES.apiVersionIsInvalid.title,
			error: [ERROR_MESSAGES.apiVersionIsInvalid.message],
			warning: []
		}

		assert.throws(() => {
			validate(invalidFile)
		}, expectedError)
	})

	it("should throw on file with wrong API version", () => {
		invalidFile = TEST_FILE_CONTENT_INVALID_API

		const expectedError: CCValidationResult = {
			title: ERROR_MESSAGES.apiVersionIsInvalid.title,
			error: [ERROR_MESSAGES.apiVersionIsInvalid.message],
			warning: []
		}

		assert.throws(() => {
			validate(invalidFile)
		}, expectedError)
	})

	it("should throw on string", () => {
		const expectedError: CCValidationResult = {
			title: ERROR_MESSAGES.fileIsInvalid.title,
			error: [ERROR_MESSAGES.fileIsInvalid.message],
			warning: []
		}

		assert.throws(() => {
			validate("" as any)
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

		validate(file)
	})

	it("should not throw on a file without edges", () => {
		file.edges = undefined

		validate(file)
	})

	it("should not throw on a file when numbers are floating point values", () => {
		file.nodes[0].children[0].attributes["rloc"] = 333.4

		validate(file)
	})

	it("should throw when children are not unique in name+type", () => {
		file.nodes[0].children[0].name = "same"
		file.nodes[0].children[0].type = NodeType.FILE
		file.nodes[0].children[1].name = "same"
		file.nodes[0].children[1].type = NodeType.FILE

		const expectedError: CCValidationResult = {
			title: ERROR_MESSAGES.nodesNotUnique.title,
			error: [ERROR_MESSAGES.nodesNotUnique.message],
			warning: []
		}

		assert.throws(() => {
			validate(file)
		}, expectedError)
	})

	it("should throw when nodes are empty", () => {
		file.nodes = []

		const expectedError: CCValidationResult = {
			title: ERROR_MESSAGES.nodesEmpty.title,
			error: [ERROR_MESSAGES.nodesEmpty.message],
			warning: []
		}

		assert.throws(() => {
			validate(file)
		}, expectedError)
	})

	it("should throw if nodes is not a node and therefore has no name or id", () => {
		file.nodes[0] = {
			something: "something"
		} as any

		const expectedError: CCValidationResult = {
			title: ERROR_MESSAGES.validationError.title,
			error: [
				"Required error: nodes[0] should have required property 'name'",
				"Required error: nodes[0] should have required property 'type'"
			],
			warning: []
		}

		assert.throws(() => {
			validate(file)
		}, expectedError)
	})

	it("attributes should not allow whitespaces", () => {
		file.nodes[0].attributes = {
			"tes t1": 0
		}

		const expectedError: CCValidationResult = {
			title: ERROR_MESSAGES.validationError.title,
			error: [
				"Required error: nodes[0] should have required property 'name'",
				"Required error: nodes[0] should have required property 'type'"
			],
			warning: []
		}

		assert.throws(() => {
			validate(file)
		}, expectedError)
	})

	it("attributes should not allow special characters", () => {
		file.nodes[0].attributes = {
			"tes)t1": 0
		}

		const expectedError: CCValidationResult = {
			title: ERROR_MESSAGES.validationError.title,
			error: [
				"Required error: nodes[0] should have required property 'name'",
				"Required error: nodes[0] should have required property 'type'"
			],
			warning: []
		}

		assert.throws(() => {
			validate(file)
		}, expectedError)
	})

	describe("fixed folders validation", () => {
		beforeEach(() => {
			file = clone(fileWithFixedFolders)
		})

		it("should throw an error, if there are fixed folders, but not every folder on root is fixed", () => {
			file.nodes[0].children[0].fixedPosition = undefined

			const expectedError: CCValidationResult = {
				title: ERROR_MESSAGES.notAllFoldersAreFixed.title,
				error: [ERROR_MESSAGES.notAllFoldersAreFixed.message + " Found: folder_1"],
				warning: []
			}

			assert.throws(() => {
				validate(file)
			}, expectedError)
		})

		it("should throw an error, if at least one fixed folder ends up in a negative coordinate", () => {
			file.nodes[0].children[0].fixedPosition.left = -5
			file.nodes[0].children[0].fixedPosition.width = 2

			const expectedError: CCValidationResult = {
				title: ERROR_MESSAGES.fixedFoldersOutOfBounds.title,
				error: [ERROR_MESSAGES.fixedFoldersOutOfBounds.message + " Found: folder_1"],
				warning: []
			}

			assert.throws(() => {
				validate(file)
			}, expectedError)
		})

		it("should throw an error, if at least one fixed folder exceeds the maximum coordinate of 100", () => {
			file.nodes[0].children[0].fixedPosition.left = 99
			file.nodes[0].children[0].fixedPosition.width = 2

			const expectedError: CCValidationResult = {
				title: ERROR_MESSAGES.fixedFoldersOutOfBounds.title,
				error: [ERROR_MESSAGES.fixedFoldersOutOfBounds.message + " Found: folder_1"],
				warning: []
			}

			assert.throws(() => {
				validate(file)
			}, expectedError)
		})

		it("should throw an error, if two folders horizontally overlap", () => {
			file.nodes[0].children[0].fixedPosition = {
				left: 0,
				top: 0,
				width: 10,
				height: 10
			}
			file.nodes[0].children[1].fixedPosition = {
				left: 5,
				top: 1,
				width: 10,
				height: 10
			}

			const expectedError: CCValidationResult = {
				title: ERROR_MESSAGES.fixedFoldersOverlapped.title,
				error: [ERROR_MESSAGES.fixedFoldersOverlapped.message + " Found: folder_1 and folder_2"],
				warning: []
			}

			assert.throws(() => {
				validate(file)
			}, expectedError)
		})

		it("should throw an error, if two folders vertically overlap", () => {
			file.nodes[0].children[0].fixedPosition = {
				left: 0,
				top: 0,
				width: 10,
				height: 10
			}
			file.nodes[0].children[1].fixedPosition = {
				left: 0,
				top: 5,
				width: 10,
				height: 10
			}

			const expectedError: CCValidationResult = {
				title: ERROR_MESSAGES.fixedFoldersOverlapped.title,
				error: [ERROR_MESSAGES.fixedFoldersOverlapped.message + " Found: folder_1 and folder_2"],
				warning: []
			}

			assert.throws(() => {
				validate(file)
			}, expectedError)
		})

		it("should throw an error, if a folder is placed inside another", () => {
			file.nodes[0].children[0].fixedPosition = {
				left: 0,
				top: 0,
				width: 10,
				height: 10
			}
			file.nodes[0].children[1].fixedPosition = {
				left: 1,
				top: 1,
				width: 1,
				height: 1
			}

			const expectedError: CCValidationResult = {
				title: ERROR_MESSAGES.fixedFoldersOverlapped.title,
				error: [ERROR_MESSAGES.fixedFoldersOverlapped.message + " Found: folder_2 and folder_1"],
				warning: []
			}

			assert.throws(() => {
				validate(file)
			}, expectedError)
		})

		it("should throw an error, if a folder has the same boundaries as another", () => {
			file.nodes[0].children[0].fixedPosition = {
				left: 0,
				top: 0,
				width: 10,
				height: 10
			}
			file.nodes[0].children[1].fixedPosition = file.nodes[0].children[0].fixedPosition

			const expectedError: CCValidationResult = {
				title: ERROR_MESSAGES.fixedFoldersOverlapped.title,
				error: [ERROR_MESSAGES.fixedFoldersOverlapped.message + " Found: folder_1 and folder_2"],
				warning: []
			}

			assert.throws(() => {
				validate(file)
			}, expectedError)
		})
	})
})
