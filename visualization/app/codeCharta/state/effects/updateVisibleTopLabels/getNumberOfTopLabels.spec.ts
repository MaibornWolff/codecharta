import { getNumberOfTopLabels } from "./getNumberOfTopLabels"

describe("getNumberOfTopLabels", () => {
    it("should return 1 when number of nodes are equal or less than 100", () => {
        const nodes = Array.from({ length: 10 }).fill({})
        expect(getNumberOfTopLabels(nodes)).toBe(1)
    })

    it("should return 1 for an empty node list", () => {
        expect(getNumberOfTopLabels({ length: 0 })).toBe(1)
    })

    it("should return 2 when number of nodes are greater than or equal to 200 and less than 300", () => {
        const nodes = Array.from({ length: 200 }).fill({})
        expect(getNumberOfTopLabels(nodes)).toBe(2)
    })

    it("should return 50 (max limit for displayed top labels) when number of nodes are greater than 5000", () => {
        const nodes = Array.from({ length: 5001 }).fill({})
        expect(getNumberOfTopLabels(nodes)).toBe(50)
    })

    it("should return 50 for very large maps", () => {
        const nodes = Array.from({ length: 100_000 }).fill({})
        expect(getNumberOfTopLabels(nodes)).toBe(50)
    })

    it("should return exactly 50 at the boundary of 5000 nodes", () => {
        expect(getNumberOfTopLabels({ length: 5000 })).toBe(50)
    })
})
