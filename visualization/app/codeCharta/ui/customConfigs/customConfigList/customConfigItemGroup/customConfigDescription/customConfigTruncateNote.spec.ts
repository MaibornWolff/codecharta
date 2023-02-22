import { CustomConfigTransformNote } from "./CustomConfigTransformNote.pipe"

describe("customConfigTruncateNotePipe", () => {
	it("should return empty placeholder sting if no string given", () => {
		expect(new CustomConfigTransformNote().transform("", 0)).toBe("Add note")
	})

	it("should return a shortened string when given string above limit", () => {
		expect(new CustomConfigTransformNote().transform("Shorten This", 5)).toBe("Short...")
	})

	it("should not modify string if below limit", () => {
		expect(new CustomConfigTransformNote().transform("Too short", 9)).toBe("Too short")
	})

	it("should allow shortening with a custom string", () => {
		expect(new CustomConfigTransformNote().transform("Too short", 4, "replaced")).toBe("Too replaced")
	})
})
