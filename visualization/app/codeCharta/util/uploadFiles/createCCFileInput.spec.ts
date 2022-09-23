import { createCCFileInput } from "./createCCFileInput"

describe("createCCFileInput", () => {
	it("should create a file input for json or gz files", () => {
		jest.spyOn(document.body, "appendChild")
		const ccFileInput = createCCFileInput()
		expect(ccFileInput.nodeName).toBe("INPUT")
		expect(ccFileInput.type).toBe("file")
		expect(ccFileInput.accept).toBe(".json,.gz")
		expect(ccFileInput.multiple).toBe(true)
		expect(document.body.appendChild).toHaveBeenCalledTimes(1)
	})
})
