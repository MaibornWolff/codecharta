import { colorLabels } from "./colorLabels.reducer"
import { ColorLabelsAction, defaultColorLabels, setColorLabels } from "./colorLabels.actions"

describe("colorLabels", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = colorLabels(undefined, {} as ColorLabelsAction)

			expect(result).toEqual(defaultColorLabels)
		})
	})

	describe("Action: SET_COLOR_LABELS", () => {
		const otherColorLabelOption = {
			positive: true,
			negative: true,
			neutral: false
		}

		it("should set new colorLabels", () => {
			const result = colorLabels(defaultColorLabels, setColorLabels(otherColorLabelOption))

			expect(result).toEqual(otherColorLabelOption)
		})

		it("should set default colorLabels", () => {
			const oldColorLabelOption = {
				positive: true,
				negative: true,
				neutral: false
			}

			const result = colorLabels(oldColorLabelOption, setColorLabels())

			expect(result).toEqual(defaultColorLabels)
		})
	})
})
