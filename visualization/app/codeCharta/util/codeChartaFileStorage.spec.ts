import { CodeChartaFileStorageEngine, CodeChartaStorage } from "./codeChartaStorage"
import fs from "fs"
jest.mock("fs")
import * as EnvironmentDetector from "./envDetector"

describe("CodeChartaStorage", () => {
	afterEach(() => {
		jest.clearAllMocks()
	})

	describe("test initialization of file storage engines", () => {
		it("should set fileStorageEngine for CodeCharta standalone version", () => {
			jest.spyOn(EnvironmentDetector, "isStandalone").mockReturnValue(true)
			jest.spyOn(CodeChartaFileStorageEngine.prototype, "clear").mockImplementation()

			const storage = new CodeChartaStorage()
			storage.clear()
			expect(CodeChartaFileStorageEngine.prototype.clear).toHaveBeenCalledTimes(1)
		})

		it("should set localStorage as storageEngine for CodeCharta web version", () => {
			jest.spyOn(EnvironmentDetector, "isStandalone").mockReturnValue(false)
			jest.spyOn(CodeChartaFileStorageEngine.prototype, "clear").mockImplementation()

			const storage = new CodeChartaStorage()
			storage.clear()
			expect(CodeChartaFileStorageEngine.prototype.clear).not.toHaveBeenCalled()
		})
	})
})

describe("CodeChartaFileStorage", () => {
	afterEach(() => {
		jest.clearAllMocks()
		jest.unmock("fs")
	})

	describe("test fileStorage", () => {
		jest.spyOn(EnvironmentDetector, "isStandalone").mockReturnValue(true)
		jest.spyOn(fs, "realpathSync").mockReturnValue("mockedRelativeFileStoragePath")
		const codeChartaStorage = new CodeChartaStorage()

		it("should call matching file-system methods", () => {
			jest.spyOn(fs, "writeFileSync").mockImplementation()
			codeChartaStorage.setItem("unit/testing", "successful")
			expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining("unit/testing"), "successful", expect.any(Object))

			jest.spyOn(fs, "readFileSync").mockReturnValueOnce("")
			codeChartaStorage.getItem("unit/testing")
			expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining("unit/testing"))

			jest.spyOn(fs, "unlinkSync").mockImplementation()
			codeChartaStorage.removeItem("unit/testing")
			expect(fs.unlinkSync).toHaveBeenNthCalledWith(1, expect.stringContaining("unit/testing"))

			// @ts-ignore
			jest.spyOn(fs, "readdirSync").mockReturnValue(["file1", "file2"])
			expect(codeChartaStorage.key(0)).toBe("file1")
			expect(codeChartaStorage.key(1)).toBe("file2")
			expect(codeChartaStorage.key(99)).toBeNull()
			expect(fs.readdirSync).toHaveBeenCalledTimes(3)

			jest.spyOn(fs, "unlinkSync").mockReset().mockImplementation()
			codeChartaStorage.clear()
			expect(fs.unlinkSync).toHaveBeenCalledTimes(2)
		})
	})
})
