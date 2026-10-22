import { setLabelSize } from "./labelSize.actions"
import { defaultLabelSize, labelSize } from "./labelSize.reducer"

describe("labelSize", () => {
    it("should default to 1.25", () => {
        expect(defaultLabelSize).toEqual(1.25)
    })

    it("should set new labelSize", () => {
        const result = labelSize(1, setLabelSize({ value: 2 }))

        expect(result).toEqual(2)
    })
})
