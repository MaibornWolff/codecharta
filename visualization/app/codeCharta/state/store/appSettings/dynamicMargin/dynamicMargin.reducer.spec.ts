import { dynamicMargin } from "./dynamicMargin.reducer"
import { DynamicMarginAction, setDynamicMargin } from "./dynamicMargin.actions"
import { setStandard } from "../../files/files.actions"

describe("dynamicMargin", () => {
	it("should initialize the default state", () => {
		expect(dynamicMargin(undefined, {} as DynamicMarginAction)).toBe(true)
	})

	it("should set new dynamicMargin", () => {
		expect(dynamicMargin(true, setDynamicMargin(false))).toBe(false)
	})

	it("should reset to true on file selection changed", () => {
		expect(dynamicMargin(false, setStandard([]))).toBe(true)
	})
})
