import { edges } from "./edges.reducer"
import { addEdge, EdgesAction, removeEdge, setEdges } from "./edges.actions"
import { VALID_EDGE } from "../../../../util/dataMocks"

describe("edges", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = edges(undefined, {} as EdgesAction)

			expect(result).toEqual([])
		})
	})

	describe("Action: SET_EDGES", () => {
		it("should set new edges", () => {
			const result = edges([], setEdges([VALID_EDGE]))

			expect(result).toEqual([VALID_EDGE])
		})

		it("should set new edges", () => {
			const result = edges([VALID_EDGE], setEdges())

			expect(result).toEqual([])
		})
	})

	describe("Action: ADD_EDGE", () => {
		it("should add an edge", () => {
			const result = edges([], addEdge(VALID_EDGE))

			expect(result).toEqual([VALID_EDGE])
		})
	})

	describe("Action: REMOVE_EDGE", () => {
		it("should remove an edge", () => {
			const result = edges([VALID_EDGE], removeEdge(VALID_EDGE))

			expect(result).toEqual([])
		})
	})
})
