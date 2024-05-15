import { getNumberOfTopLabels } from "./getNumberOfTopLabels"

describe("getNumberOfTopLabels", () => {
    it("should return 1 when number of nodes are equal or less than 100", () => {
        const nodes = Array.from({ length: 10 }).fill({})
        expect(getNumberOfTopLabels(nodes)).toBe(1)
    })

    it("should return 2 when number of nodes are greater than or equal to 200 and less than 300", () => {
        const nodes = Array.from({ length: 200 }).fill({})
        expect(getNumberOfTopLabels(nodes)).toBe(2)
    })

    it("should return 10 (max limit for displayed top labels) when number of nodes are greater than 1000", () => {
        const nodes = Array.from({ length: 1001 }).fill({})
        expect(getNumberOfTopLabels(nodes)).toBe(10)
    })
})
