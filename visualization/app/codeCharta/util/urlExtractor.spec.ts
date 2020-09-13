import { getService } from "../../../mocks/ng.mockhelper"
import { ILocationService, IHttpService } from "angular"
import { UrlExtractor } from "./urlExtractor"

describe("urlExtractor", () => {
	let urlExtractor: UrlExtractor
	let $location: ILocationService
	let $http: IHttpService

	beforeEach(() => {
		restartSystem()
		withMockedMethods()
		rebuildController()
	})

	function restartSystem() {
		$location = getService<ILocationService>("$location")
		$http = getService<IHttpService>("$http")
	}

	function rebuildController() {
		urlExtractor = new UrlExtractor($location, $http)
	}

	function withMockedMethods() {
		$location.absUrl = jest.fn(() => {
			return "http://testurl?file=valid.json"
		})

		$http.get = jest.fn().mockImplementation(async () => {
			return { data: "some data", status: 200 }
		})
	}

	describe("getParameterByName", () => {
		it("should return fileName for given parameter name 'file'", () => {
			const result = urlExtractor.getParameterByName("file")
			expect(result).toBe("valid.json")
		})

		it("should return renderMode for given parameter name 'mode'", () => {
			$location.absUrl = jest.fn(() => {
				return "http://testurl?file=valid.json&mode=Delta"
			})
			const result = urlExtractor.getParameterByName("mode")
			expect(result).toBe("Delta")
		})
	})

	describe("getFileDataFromQueryParam", () => {
		it("should return an empty array when file is undefined", async () => {
			$location.search = jest.fn().mockReturnValue({})

			const result = await urlExtractor.getFileDataFromQueryParam()
			const expected = []

			expect(result).toEqual(expected)
		})

		it("should create an array when file is defined but not as an array", async () => {
			$location.search = jest.fn().mockReturnValue({
				file: { data: "some data" }
			})

			urlExtractor.getFileDataFromFile = jest.fn().mockImplementation(async (fileName: string) => fileName)

			const result = await urlExtractor.getFileDataFromQueryParam()
			const expected = [{ data: "some data" }]

			expect(result).toEqual(expected)
			expect(urlExtractor.getFileDataFromFile).toHaveBeenCalledTimes(1)
			expect(urlExtractor.getFileDataFromFile).toHaveBeenCalledWith({ data: "some data" })
		})

		it("should return an array of resolved file data", async () => {
			$location.search = jest.fn().mockReturnValue({ file: ["some data", "some more"] })

			urlExtractor.getFileDataFromFile = jest.fn().mockImplementation(async (fileName: string) => fileName)

			const expected = ["some data", "some more"]

			return expect(urlExtractor.getFileDataFromQueryParam()).resolves.toEqual(expected)
		})

		it("should return the first filename rejected", async () => {
			$location.search = jest.fn().mockReturnValue({ file: ["some data", "some more"] })

			urlExtractor.getFileDataFromFile = jest.fn(fileName => {
				throw fileName
			})

			const expected = "some data"

			return expect(urlExtractor.getFileDataFromQueryParam()).rejects.toMatch(expected)
		})
	})

	describe("getFileDataFromFile", () => {
		it("should reject if file is not existing ", async () => {
			return expect(urlExtractor.getFileDataFromFile(null)).rejects.toEqual(new Error("Filename is missing"))
		})

		it("should reject if file length is 0 ", async () => {
			return expect(urlExtractor.getFileDataFromFile("")).rejects.toEqual(new Error("Filename is missing"))
		})

		it("should resolve data and return an object with content and fileName", async () => {
			const expected = { content: "some data", fileName: "test.json" }
			return expect(urlExtractor.getFileDataFromFile("test.json")).resolves.toEqual(expected)
		})

		it("should reject if statuscode is not 2xx", async () => {
			$http.get = jest.fn().mockImplementation(async () => {
				return { data: "some data", status: 301 }
			})

			return expect(urlExtractor.getFileDataFromFile("test.json")).rejects.toEqual(new Error(`Could not load file "test.json"`))
		})
	})
})
