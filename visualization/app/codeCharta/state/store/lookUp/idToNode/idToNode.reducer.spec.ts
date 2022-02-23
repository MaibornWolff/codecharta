import { idToNode } from "./idToNode.reducer"
import { IdToNodeAction, setIdToNode } from "./idToNode.actions"
import { NodeDecorator } from "../../../../util/nodeDecorator"
import { TEST_FILE_WITH_PATHS } from "../../../../util/dataMocks"
import { CodeMapNode } from "../../../../codeCharta.model"

describe("idToNode", () => {
	beforeEach(() => {
		NodeDecorator.decorateMapWithPathAttribute(TEST_FILE_WITH_PATHS)
	})

	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = idToNode(undefined, {} as IdToNodeAction)

			expect(result).toEqual(new Map())
		})
	})

	describe("Action: SET_ID_TO_NODE", () => {
		it("should set new idToNode", () => {
			const map = new Map<number, CodeMapNode>()
			map.set(TEST_FILE_WITH_PATHS.map.id, TEST_FILE_WITH_PATHS.map)

			const result = idToNode(new Map(), setIdToNode(map))

			expect(result).toEqual(map)
		})

		it("should set default idToNode", () => {
			const map = new Map<number, CodeMapNode>()
			map.set(TEST_FILE_WITH_PATHS.map.id, TEST_FILE_WITH_PATHS.map)

			const result = idToNode(map, setIdToNode())

			expect(result).toEqual(new Map())
		})
	})
})
