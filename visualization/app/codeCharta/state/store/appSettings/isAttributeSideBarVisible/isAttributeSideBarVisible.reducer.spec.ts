import { isAttributeSideBarVisible } from "./isAttributeSideBarVisible.reducer"
import {
	closeAttributeSideBar,
	IsAttributeSideBarVisibleAction,
	openAttributeSideBar,
	setIsAttributeSideBarVisible
} from "./isAttributeSideBarVisible.actions"

describe("isAttributeSideBarVisible", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = isAttributeSideBarVisible(undefined, {} as IsAttributeSideBarVisibleAction)

			expect(result).toBeFalsy()
		})
	})

	describe("Action: SET_IS_ATTRIBUTE_SIDE_BAR_VISIBLE", () => {
		it("should set new isAttributeSideBarVisible", () => {
			const result = isAttributeSideBarVisible(false, setIsAttributeSideBarVisible(true))

			expect(result).toBeTruthy()
		})

		it("should set default isAttributeSideBarVisible", () => {
			const result = isAttributeSideBarVisible(true, setIsAttributeSideBarVisible())

			expect(result).toBeFalsy()
		})
	})

	describe("Action: OPEN_ATTRIBUTE_SIDE_BAR", () => {
		it("should set new isAttributeSideBarVisible", () => {
			const result = isAttributeSideBarVisible(false, openAttributeSideBar())

			expect(result).toBeTruthy()
		})
	})

	describe("Action: CLOSE_ATTRIBUTE_SIDE_BAR", () => {
		it("should set default isAttributeSideBarVisible", () => {
			const result = isAttributeSideBarVisible(true, closeAttributeSideBar())

			expect(result).toBeFalsy()
		})
	})
})
