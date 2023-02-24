import { MetricDescriptors } from "app/codeCharta/ui/attributeSideBar/util/metricDescriptors"
import { MetricDescriptorTitlePipe } from "./metricDescriptorTitle.pipe"

const testKey = "testKey"
const testTitle = "testTitle"
const testHighValue = "testHighValue"
const testLowValue = "testLowValue"
const testDescription = "testDescription"
const testLink = "testLink"
const pipe = new MetricDescriptorTitlePipe()
let md: MetricDescriptors = {
	key: testKey,
	title: null,
	description: null,
	hintLowValue: null,
	hintHighValue: null,
	link: null
}

describe("metricDescriptorTitlePipe", () => {
	beforeEach(() => {
		md = {
			key: testKey,
			title: null,
			description: null,
			hintLowValue: null,
			hintHighValue: null,
			link: null
		}
	})

	it("should return empty string for null", () => {
		expect(pipe.transform(null)).toBe("")
	})

	it("should return empty string for undefined", () => {
		expect(pipe.transform(undefined)).toBe("")
	})

	it("should be key if only key is present", () => {
		expect(pipe.transform(md)).toBe(testKey)
	})

	it('should be "title (key)" if present', () => {
		md.title = testTitle
		expect(pipe.transform(md)).toBe(`${testTitle} (${testKey})`)
	})

	it("should contain : if more information available", () => {
		md.hintLowValue = testLowValue
		expect(pipe.transform(md)).toContain(":")
	})

	it("should include full information", () => {
		md.title = testTitle
		md.description = testDescription
		md.hintHighValue = testHighValue
		md.hintLowValue = testLowValue
		const result = `${testTitle} (${testKey}):\n${testDescription}\nHigh Values: ${testHighValue}\nLow Values: ${testLowValue}`
		expect(pipe.transform(md)).toBe(result)
	})

	it("should not include link", () => {
		md.description = testDescription
		md.link = testLink
		expect(pipe.transform(md)).toBe(`${testKey}:\n${testDescription}`)
	})
})
