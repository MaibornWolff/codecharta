import { AttributeDescriptorTooltipPipe } from "./attributeDescriptorTooltip.pipe"
import { AttributeDescriptor } from "../../codeCharta.model"

const testKey = "testKey"
const testTitle = "testTitle"
const testHighValue = "testHighValue"
const testLowValue = "testLowValue"
const testDescription = "testDescription"
const testLink = "testLink"
let pipe: AttributeDescriptorTooltipPipe
let aD: AttributeDescriptor

describe("attributeDescriptorTooltipPipe", () => {
	beforeEach(() => {
		aD = {
			title: null,
			description: null,
			hintLowValue: null,
			hintHighValue: null,
			link: null
		}
		pipe = new AttributeDescriptorTooltipPipe()
	})

	it("should return empty string for null", () => {
		expect(pipe.transform(null, "")).toBe("")
	})

	it("should return empty string for undefined", () => {
		expect(pipe.transform(undefined, "")).toBe("")
	})

	it("should be key if only key is present", () => {
		expect(pipe.transform(aD, testKey)).toBe(testKey)
	})

	it('should be "title (key)" if present', () => {
		aD.title = testTitle
		expect(pipe.transform(aD, testKey)).toBe(`${testTitle} (${testKey})`)
	})

	it("should contain : if more information available", () => {
		aD.hintLowValue = testLowValue
		expect(pipe.transform(aD, testKey)).toContain(":")
	})

	it("should include full information", () => {
		aD.title = testTitle
		aD.description = testDescription
		aD.hintHighValue = testHighValue
		aD.hintLowValue = testLowValue
		const result = `${testTitle} (${testKey}):\n${testDescription}\nHigh Values: ${testHighValue}\nLow Values: ${testLowValue}`
		expect(pipe.transform(aD, testKey)).toBe(result)
	})

	it("should not include link", () => {
		aD.description = testDescription
		aD.link = testLink
		expect(pipe.transform(aD, testKey)).toBe(`${testKey}:\n${testDescription}`)
	})
})
