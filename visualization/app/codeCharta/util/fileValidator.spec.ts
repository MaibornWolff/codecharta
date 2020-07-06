import {
	TEST_FILE_CONTENT,
	TEST_FILE_CONTENT_INVALID_API,
	TEST_FILE_CONTENT_INVALID_MAJOR_API,
	TEST_FILE_CONTENT_INVALID_MINOR_API,
	TEST_FILE_CONTENT_NO_API
} from "./dataMocks"
import { NodeType } from "../codeCharta.model"
import { ERROR_MESSAGES, validate } from "./fileValidator"

describe("FileValidator", () => {
	let file
	let invalidFile

	beforeEach(() => {
		file = TEST_FILE_CONTENT
	})

	function expectFileToBeValid(errors) {
		expect(errors.error.length).toBe(0)
	}

	function expectFileToBeInvalid(errors) {
		expect(errors.error.length).toBeGreaterThan(0)
	}

	function expectFileToThrowResult(file) {
		expect(() => {
			validate(file)
		}).toThrow()
	}

	function expectFileNotToThrowResult(file) {
		expect(() => {
			validate(file)
		}).not.toThrow()
	}

	it("API version exists in package.json", () => {
		expect(require("../../../package.json").codecharta.apiVersion).toEqual("1.1")
	})

	it("should throw on null", () => {
		expectFileToThrowResult(invalidFile)
		try {
			validate(null)
		} catch (e) {
			expectFileToBeInvalid(e)
			expect(e.title).toEqual(ERROR_MESSAGES.fileIsInvalid.title)
			expect(e.error[0]).toEqual(ERROR_MESSAGES.fileIsInvalid.message)
		}
	})

	it("should throw when higher Major API", () => {
		invalidFile = TEST_FILE_CONTENT_INVALID_MAJOR_API

		expectFileToThrowResult(invalidFile)
		try {
			validate(invalidFile)
		} catch (e) {
			expectFileToBeInvalid(e)
			expect(e.title).toEqual(ERROR_MESSAGES.majorApiVersionIsOutdated.title)
			expect(e.error[0]).toEqual(ERROR_MESSAGES.majorApiVersionIsOutdated.message)
		}
	})

	it("should throw on warning with higher minor API version", () => {
		file = TEST_FILE_CONTENT_INVALID_MINOR_API

		expectFileToThrowResult(file)
		try {
			validate(file)
		} catch (e) {
			expectFileToBeValid(e)
			expect(e.warning.length).toBeGreaterThan(0)
			expect(e.title).toEqual(ERROR_MESSAGES.minorApiVersionOutdated.title)
			expect(e.warning[0]).toEqual(ERROR_MESSAGES.minorApiVersionOutdated.message)
		}
	})

	it("should throw on file missing API version", () => {
		invalidFile = TEST_FILE_CONTENT_NO_API

		expectFileToThrowResult(invalidFile)
		try {
			validate(invalidFile)
		} catch (e) {
			expectFileToBeInvalid(e)
			expect(e.title).toEqual(ERROR_MESSAGES.apiVersionIsInvalid.title)
			expect(e.error[0]).toEqual(ERROR_MESSAGES.apiVersionIsInvalid.message)
		}
	})

	it("should throw on file with wrong API version", () => {
		invalidFile = TEST_FILE_CONTENT_INVALID_API

		expectFileToThrowResult(invalidFile)
		try {
			validate(invalidFile)
		} catch (e) {
			expectFileToBeInvalid(e)
			expect(e.title).toEqual(ERROR_MESSAGES.apiVersionIsInvalid.title)
			expect(e.error[0]).toEqual(ERROR_MESSAGES.apiVersionIsInvalid.message)
		}
	})

	it("should throw on string", () => {
		expectFileToThrowResult(invalidFile)
		try {
			validate("" as any)
		} catch (e) {
			expect(e.title).toEqual(ERROR_MESSAGES.fileIsInvalid.title)
			expect(e.error[0]).toEqual(ERROR_MESSAGES.fileIsInvalid.message)
		}
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

		expectFileNotToThrowResult(file)
	})

	it("should not throw on a file without edges", () => {
		file.edges = undefined

		expectFileNotToThrowResult(file)
	})

	it("should not throw on a file when numbers are floating point values", () => {
		file.nodes[0].children[0].attributes["rloc"] = 333.4

		expectFileNotToThrowResult(file)
	})

	it("should throw when children are not unique in name+type", () => {
		file.nodes[0].children[0].name = "same"
		file.nodes[0].children[0].type = NodeType.FILE
		file.nodes[0].children[1].name = "same"
		file.nodes[0].children[1].type = NodeType.FILE

		expectFileToThrowResult(invalidFile)
		try {
			validate(file)
		} catch (e) {
			expectFileToBeInvalid(e)
			expect(e.title).toEqual(ERROR_MESSAGES.nodesNotUnique.title)
			expect(e.error[0]).toEqual(ERROR_MESSAGES.nodesNotUnique.message)
		}
	})

	it("should throw when nodes are empty", () => {
		file.nodes[0] = []

		expectFileToThrowResult(invalidFile)
		try {
			validate(file)
		} catch (e) {
			expectFileToBeInvalid(e)
			expect(e.title).toEqual(ERROR_MESSAGES.validationError.title)
		}
	})

	it("should throw if nodes is not a node and therefore has no name or id", () => {
		file.nodes[0] = {
			something: "something"
		}

		expectFileToThrowResult(invalidFile)
		try {
			validate(file)
		} catch (e) {
			expectFileToBeInvalid(e)
		}
	})

	it("attributes should not allow whitespaces", () => {
		file.nodes[0].attributes = {
			"tes t1": 0
		}

		expectFileToThrowResult(invalidFile)
		try {
			validate(file)
		} catch (e) {
			expectFileToBeInvalid(e)
		}
	})

	it("attributes should not allow special characters", () => {
		file.nodes[0].attributes = {
			"tes)t1": 0
		}

		expectFileToThrowResult(invalidFile)
		try {
			validate(file)
		} catch (e) {
			expectFileToBeInvalid(e)
		}
	})
})
