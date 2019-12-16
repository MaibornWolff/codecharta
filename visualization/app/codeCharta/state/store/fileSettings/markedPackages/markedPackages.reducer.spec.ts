import { markedPackages } from "./markedPackages.reducer"
import { MarkedPackagesAction, markPackage, setMarkedPackages, unmarkPackage } from "./markedPackages.actions"
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

	describe("Action: MARK_PACKAGE", () => {
		it("should add a new marked package to array", () => {
			const result = markedPackages([], markPackage(MARKED_PACKAGES[0]))

			expect(result).toEqual([MARKED_PACKAGES[0]])
		})
	})

	describe("Action: UNMARK_PACKAGE", () => {
		it("should remove a marked package from array", () => {
			const result = markedPackages([MARKED_PACKAGES[0]], unmarkPackage(MARKED_PACKAGES[0]))

			expect(result).toEqual([])
		})
	})
})
