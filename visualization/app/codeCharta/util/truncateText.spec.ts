import { TruncateTextPipe } from "./truncateText.pipe"

describe("TruncateTextPipe", () => {
	it("should return empty placeholder string if no string given", () => {
		expect(new TruncateTextPipe().transform("", 0)).toBe("")
	})

	it("should return a shortened string when given string above limit", () => {
		expect(new TruncateTextPipe().transform("123456", 5)).toBe("12345...")
	})

	it("should not modify string if below limit", () => {
		expect(new TruncateTextPipe().transform("12345", 6)).toBe("12345")
	})

	it("should allow shortening with a custom string", () => {
		expect(new TruncateTextPipe().transform("12345", 4, "ab")).toBe("1234ab")
	})
})
