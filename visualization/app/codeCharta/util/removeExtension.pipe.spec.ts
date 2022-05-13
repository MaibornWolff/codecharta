import { RemoveExtensionPipe } from "./removeExtension.pipe"

describe("removeExtensionPipe", () => {
	it("should remove file extension .cc.json", () => {
		expect(new RemoveExtensionPipe().transform("sample.cc.json")).toBe("sample")
	})

	it("should remove file extension .cc.json.gz", () => {
		expect(new RemoveExtensionPipe().transform("sample.cc.json.gz")).toBe("sample")
	})

	it("should remove file extensions once .cc.json.gz", () => {
		expect(new RemoveExtensionPipe().transform("sample.cc.json.cc.json.gz")).toBe("sample.cc.json")
	})
})
