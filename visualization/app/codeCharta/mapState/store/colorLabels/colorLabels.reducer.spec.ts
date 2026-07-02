import { colorLabels, defaultColorLabelOptions } from "./colorLabels.reducer"
import { setColorLabels } from "./colorLabels.actions"

describe("colorLabels", () => {
    const otherColorLabelOption = {
        positive: true,
        negative: true,
        neutral: false
    }

    it("should set new colorLabels", () => {
        const result = colorLabels(defaultColorLabelOptions, setColorLabels({ value: otherColorLabelOption }))

        expect(result).toEqual(otherColorLabelOption)
    })
})
