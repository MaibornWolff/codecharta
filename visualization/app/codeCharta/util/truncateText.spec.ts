import { TruncateTextPipe } from "./truncateText.pipe"

describe("TruncateTextPipe", () => {
	it("should return empty placeholder sting if no string given", () => {
		expect(new TruncateTextPipe().transform("", 0)).toBe("Add note")
	})

	it("should return a shortened string when given string above limit", () => {
		expect(new TruncateTextPipe().transform("Shorten This", 5)).toBe("Short...")
	})

	it("should not modify string if below limit", () => {
		expect(new TruncateTextPipe().transform("Too short", 9)).toBe("Too short")
	})

	it("should allow shortening with a custom string", () => {
		expect(new TruncateTextPipe().transform("Too short", 4, "replaced")).toBe("Too replaced")
	})
})
