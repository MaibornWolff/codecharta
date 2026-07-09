import { setColorLabels } from "./colorLabels.actions"
import { colorLabels, defaultColorLabelOptions } from "./colorLabels.reducer"

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
