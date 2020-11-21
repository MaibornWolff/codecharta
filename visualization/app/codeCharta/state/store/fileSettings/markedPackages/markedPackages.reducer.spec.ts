import { markedPackages } from "./markedPackages.reducer"
import { MarkedPackagesAction, setMarkedPackages, unmarkPackage } from "./markedPackages.actions"
import { MARKED_PACKAGES } from "../../../../util/dataMocks"

describe("markedPackages", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = markedPackages(undefined, {} as MarkedPackagesAction)

			expect(result).toEqual([])
		})
	})

	describe("Action: SET_MARKED_PACKAGES", () => {
		it("should set new markedPackages", () => {
			const result = markedPackages([], setMarkedPackages(MARKED_PACKAGES))

			expect(result).toEqual(MARKED_PACKAGES)
		})

		it("should set default markedPackages", () => {
			const result = markedPackages(MARKED_PACKAGES, setMarkedPackages())

			expect(result).toEqual([])
		})
	})

	describe("Action: UNMARK_PACKAGE", () => {
		it("should remove a marked package from array", () => {
			const result = markedPackages([MARKED_PACKAGES[0]], unmarkPackage(0))

			expect(result).toEqual([])
		})
	})
})
