import { colorLabels, defaultColorLabels } from "./colorLabels.reducer"
import { setColorLabels } from "./colorLabels.actions"

describe("colorLabels", () => {
	const otherColorLabelOption = {
		positive: true,
		negative: true,
		neutral: false
	}

	it("should set new colorLabels", () => {
		const result = colorLabels(defaultColorLabels, setColorLabels({ value: otherColorLabelOption }))

		expect(result).toEqual(otherColorLabelOption)
	})
})
