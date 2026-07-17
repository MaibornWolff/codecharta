import { setMargin } from "./margin.actions"
import { margin } from "./margin.reducer"

describe("margin", () => {
    it("should set new margin", () => {
        expect(margin(21, setMargin({ value: 42 }))).toEqual(42)
    })
})
