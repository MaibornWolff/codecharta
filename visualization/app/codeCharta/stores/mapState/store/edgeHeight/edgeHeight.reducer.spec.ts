import { setEdgeHeight } from "./edgeHeight.actions"
import { edgeHeight } from "./edgeHeight.reducer"

describe("edgeHeight", () => {
    it("should set new edgeHeight", () => {
        const result = edgeHeight(4, setEdgeHeight({ value: 1 }))

        expect(result).toEqual(1)
    })
})
