import { isAttributeSideBarVisible } from "./isAttributeSideBarVisible.reducer"
import { IsAttributeSideBarVisibleAction, setIsAttributeSideBarVisible } from "./isAttributeSideBarVisible.actions"

describe("isAttributeSideBarVisible", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = isAttributeSideBarVisible(undefined, {} as IsAttributeSideBarVisibleAction)

			expect(result).toEqual(false)
		})
	})

	describe("Action: SET_IS_ATTRIBUTE_SIDE_BAR_VISIBLE", () => {
		it("should set new isAttributeSideBarVisible", () => {
			const result = isAttributeSideBarVisible(false, setIsAttributeSideBarVisible(true))

			expect(result).toEqual(true)
		})

		it("should set default isAttributeSideBarVisible", () => {
			const result = isAttributeSideBarVisible(true, setIsAttributeSideBarVisible())

			expect(result).toEqual(false)
		})
	})
})
