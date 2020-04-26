import { FileValidator } from "./fileValidator"
import {
	TEST_FILE_CONTENT,
	TEST_FILE_CONTENT_INVALID_API,
	TEST_FILE_CONTENT_INVALID_MAJOR_API,
	TEST_FILE_CONTENT_INVALID_MINOR_API,
	TEST_FILE_CONTENT_NO_API
} from "./dataMocks"
import { NodeType } from "../codeCharta.model"

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

	it("API version exists in package.json", () => {
		expect(require("../../../package.json").codecharta.apiVersion).toEqual("1.1")
	})

	it("should reject null", () => {
		const errors = FileValidator.validate(null)

		expectFileToBeInvalid(errors)
		expect(errors.title).toEqual("Error Loading File")
	})

	it("should reject higher Major API", () => {
		invalidFile = TEST_FILE_CONTENT_INVALID_MAJOR_API

		const errors = FileValidator.validate(invalidFile)

		expectFileToBeInvalid(errors)
		expect(errors.title).toEqual("Error Major API Version")
	})

	it("should not reject higher minor API version but add warning", () => {
		file = TEST_FILE_CONTENT_INVALID_MINOR_API

		const errors = FileValidator.validate(file)

		expectFileToBeValid(errors)
		expect(errors.warning.length).toBeGreaterThan(0)
		expect(errors.title).toEqual("Warning Minor API Version")
	})

	it("should reject file missing API version", () => {
		invalidFile = TEST_FILE_CONTENT_NO_API

		const errors = FileValidator.validate(invalidFile)

		expectFileToBeInvalid(errors)
		expect(errors.title).toEqual("Error API Version")
	})

	it("should reject file with wrong API version", () => {
		invalidFile = TEST_FILE_CONTENT_INVALID_API

		const errors = FileValidator.validate(invalidFile)

		expectFileToBeInvalid(errors)
		expect(errors.title).toEqual("Error API Version")
	})

	it("should reject string", () => {
		const errors = FileValidator.validate("" as any)

		expectFileToBeInvalid(errors)
		expect(errors.title).toEqual("Error Loading File")
	})

	it("should not reject a file with edges", () => {
		file.edges = [
			{
				fromNodeName: "a",
				toNodeName: "b",
				attributes: {
					avgCommits: 42,
					pairingRate: 80
				},
				visible: false
			}
		]

		const errors = FileValidator.validate(file)

		expectFileToBeValid(errors)
	})

	it("should not reject a file without edges", () => {
		file.edges = undefined

		const errors = FileValidator.validate(file)

		expectFileToBeValid(errors)
	})

	it("should not reject a file when numbers are floating point values", () => {
		file.nodes[0].children[0].attributes["rloc"] = 333.4

		const errors = FileValidator.validate(file)

		expectFileToBeValid(errors)
	})

	it("should reject when children are not unique in name+type", () => {
		file.nodes[0].children[0].name = "same"
		file.nodes[0].children[0].type = NodeType.FILE
		file.nodes[0].children[1].name = "same"
		file.nodes[0].children[1].type = NodeType.FILE

		const errors = FileValidator.validate(file)

		expectFileToBeInvalid(errors)
		expect(errors.title).toEqual("Error Node Uniques")
	})

	it("should reject when nodes are empty", () => {
		file.nodes[0] = []

		const errors = FileValidator.validate(file)

		expectFileToBeInvalid(errors)
		expect(errors.title).toEqual("Error Validation")
	})

	it("should reject if nodes is not a node and therefore has no name or id", () => {
		file.nodes[0] = {
			something: "something"
		}

		const errors = FileValidator.validate(file)

		expectFileToBeInvalid(errors)
	})

	it("attributes should not allow whitespaces", () => {
		file.nodes[0].attributes = {
			"tes t1": 0
		}

		const errors = FileValidator.validate(file)

		expectFileToBeInvalid(errors)
	})

	it("attributes should not allow special characters", () => {
		file.nodes[0].attributes = {
			"tes)t1": 0
		}

		const errors = FileValidator.validate(file)

		expectFileToBeInvalid(errors)
	})
})
