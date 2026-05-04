import { defaultLabelSize, labelSize } from "./labelSize.reducer"
import { setLabelSize } from "./labelSize.actions"

describe("labelSize", () => {
    it("should default to 1", () => {
        expect(defaultLabelSize).toEqual(1)
    })

    it("should set new labelSize", () => {
        const result = labelSize(1, setLabelSize({ value: 2 }))

        expect(result).toEqual(2)
    })
})
