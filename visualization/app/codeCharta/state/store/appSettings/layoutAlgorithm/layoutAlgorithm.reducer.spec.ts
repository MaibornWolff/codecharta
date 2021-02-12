import { layoutAlgorithm } from "./layoutAlgorithm.reducer"
import { LayoutAlgorithmAction, setLayoutAlgorithm } from "./layoutAlgorithm.actions"
import { LayoutAlgorithm } from "../../../../codeCharta.model"

describe("layoutAlgorithm", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = layoutAlgorithm(undefined, {} as LayoutAlgorithmAction)
			expect(result).toEqual(LayoutAlgorithm.SquarifiedTreeMap)
		})
	})

	describe("setLayoutAlgorithm", () => {
		it("should set new layoutAlgorithm", () => {
			const result = layoutAlgorithm(LayoutAlgorithm.SquarifiedTreeMap, setLayoutAlgorithm(LayoutAlgorithm.StreetMap))
			expect(result).toEqual(LayoutAlgorithm.StreetMap)
		})

		it("should set default layoutAlgorithm", () => {
			const result = layoutAlgorithm(LayoutAlgorithm.StreetMap, setLayoutAlgorithm())
			expect(result).toEqual(LayoutAlgorithm.SquarifiedTreeMap)
		})
	})
})
