import { createCCFileInput } from "./createCCFileInput"

describe("createCCFileInput", () => {
	it("should create a file input for json or gs files", () => {
		const ccFileInput = createCCFileInput()
		expect(ccFileInput.nodeName).toBe("INPUT")
		expect(ccFileInput.type).toBe("file")
		expect(ccFileInput.accept).toBe(".json,.gz")
		expect(ccFileInput.multiple).toBe(true)
	})
})
