import { LazyLoader } from "./lazyLoader"

describe("LazyLoader", () => {
	beforeEach(() => {
		process.env.STANDALONE = "true"
	})

	it("should return from openFile if app mode is not standalone", () => {
		process.env.STANDALONE = "false"
		LazyLoader.openFile("file", "path")
		expect(LazyLoader["_filePath"]).toBeUndefined()
		expect(LazyLoader["_nodePath"]).toBeUndefined()
	})

	it("should call setDirectory if not yet set in localStorage", () => {
		localStorage.getItem = jest.fn().mockReturnValue(null)
		const setDirectorySpy = jest.spyOn(LazyLoader.prototype as any, "setDirectory")
		setDirectorySpy.mockImplementation(() => {})

		window.prompt = jest.fn().mockReturnValue("path")
		LazyLoader.openFile("file")
		expect(localStorage.getItem("file")).toEqual("path")
	})
})
