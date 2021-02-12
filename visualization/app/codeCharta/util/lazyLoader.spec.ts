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
		localStorage.setItem = jest.fn()
		LazyLoader["setDirectory"] = jest.fn()
		window.prompt = jest.fn().mockReturnValue("path")

		LazyLoader.openFile("file", "path")
		expect(LazyLoader["setDirectory"]).toHaveBeenCalled()
	})

	it("should call setDirectory if root is wrong", () => {
		localStorage.getItem = jest.fn()
		LazyLoader["checkDirExists"] = jest.fn().mockReturnValue(false)
		LazyLoader["setDirectory"] = jest.fn()

		LazyLoader.openFile("file", "path")
		expect(LazyLoader["setDirectory"]).toHaveBeenCalled()
	})
})
