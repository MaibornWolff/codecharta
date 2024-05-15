import { edges } from "./edges.reducer"
import { addEdge, removeEdge, setEdges } from "./edges.actions"
import { VALID_EDGE } from "../../../../util/dataMocks"

describe("edges", () => {
    describe("Action: SET_EDGES", () => {
        it("should set new edges", () => {
            const result = edges([], setEdges({ value: [VALID_EDGE] }))

            expect(result).toEqual([VALID_EDGE])
        })
    })

    describe("Action: ADD_EDGE", () => {
        it("should add an edge", () => {
            const result = edges([], addEdge({ edge: VALID_EDGE }))

            expect(result).toEqual([VALID_EDGE])
        })
    })

    describe("Action: REMOVE_EDGE", () => {
        it("should remove an edge", () => {
            const result = edges([VALID_EDGE], removeEdge({ edge: VALID_EDGE }))

            expect(result).toEqual([])
        })
    })
})
