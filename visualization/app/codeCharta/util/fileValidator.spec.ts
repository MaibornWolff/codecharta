import { TEST_FILE_CONTENT } from "./dataMocks"
import { NodeType } from "../codeCharta.model"
import { validate } from "./fileValidator"

describe("FileValidator", () => {
	let file

	beforeEach(() => {
		file = TEST_FILE_CONTENT
	})

	function expectFileToBeValid(errors) {
		expect(errors.length).toBe(0)
	}

	function expectFileToBeInvalid(errors) {
		expect(errors.length).toBeGreaterThan(0)
	}

	it("should reject null", () => {
		const errors = validate(null)
		expectFileToBeInvalid(errors)
	})

	it("should reject string", () => {
		const errors = validate("" as any)
		expectFileToBeInvalid(errors)
	})

	it("should not reject a file with edges", () => {
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
		const errors = validate(file)
		expectFileToBeValid(errors)
	})

	it("should not reject a file without edges", () => {
		file.edges = undefined
		const errors = validate(file)
		expectFileToBeValid(errors)
	})

	it("should not reject a file when numbers are floating point values", () => {
		file.nodes[0].children[0].attributes["rloc"] = 333.4
		const errors = validate(file)
		expectFileToBeValid(errors)
	})

	it("should reject when children are not unique in name+type", () => {
		file.nodes[0].children[0].name = "same"
		file.nodes[0].children[0].type = NodeType.FILE
		file.nodes[0].children[1].name = "same"
		file.nodes[0].children[1].type = NodeType.FILE
		const errors = validate(file)
		expectFileToBeInvalid(errors)
	})

	it("should reject when nodes are empty", () => {
		file.nodes[0] = []
		const errors = validate(file)
		expectFileToBeInvalid(errors)
	})

	it("should reject if nodes is not a node and therefore has no name or id", () => {
		file.nodes[0] = {
			something: "something"
		}
		const errors = validate(file)
		expectFileToBeInvalid(errors)
	})

	it("attributes should not allow whitespaces", () => {
		file.nodes[0].attributes = {
			"tes t1": 0
		}
		const errors = validate(file)
		expectFileToBeInvalid(errors)
	})

	it("attributes should not allow special characters", () => {
		file.nodes[0].attributes = {
			"tes)t1": 0
		}

		const errors = validate(file)
		expectFileToBeInvalid(errors)
	})
})
