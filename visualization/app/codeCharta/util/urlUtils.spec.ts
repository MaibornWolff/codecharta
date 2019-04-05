import { getService } from "../../../mocks/ng.mockhelper"
import { ILocationService, IHttpService } from "angular"
import { UrlUtils } from "./urlUtils"

describe("urlUtils", () => {
	let urlUtils: UrlUtils
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
		urlUtils = new UrlUtils($location, $http)
	}

	function withMockedMethods() {
		$location.absUrl = jest.fn(() => {
			return "http://testurl?file=valid.json"
		})

		$http.get = jest.fn(file => {
			return new Promise((resolve, reject) => {
				resolve({ data: "some data", status: 200 })
			})
		})
	}

	afterEach(() => {
		jest.resetAllMocks()
	})

	//TODO: Figure out what getParameterByName does
	describe("getParameterByName", () => {
		it("should ", () => {
			const result = urlUtils.getParameterByName("http://testurl?file=valid.json")

			expect(result).toBe(null)
		})
	})

	describe("getFileDataFromQueryParam", () => {
		it("should return an empty array when file is undefined", async () => {
			$location.search = jest.fn(() => {
				return {}
			})

			const result = await urlUtils.getFileDataFromQueryParam()
			const expected = []

			expect(result).toEqual(expected)
		})

		it("should create an array when file is defined but not as an array", async () => {
			$location.search = jest.fn(() => {
				return { file: { data: "some data" } }
			})
			urlUtils.getFileDataFromFile = jest.fn(fileName => {
				return new Promise((resolve, reject) => {
					resolve(fileName)
				})
			})

			const result = await urlUtils.getFileDataFromQueryParam()
			const expected = [{ data: "some data" }]

			expect(result).toEqual(expected)
			expect(urlUtils.getFileDataFromFile).toHaveBeenCalledTimes(1)
			expect(urlUtils.getFileDataFromFile).toHaveBeenCalledWith({ data: "some data" })
		})

		it("should return an array of resolved file data", () => {
			$location.search = jest.fn(() => {
				return { file: ["some data", "some more"] }
			})

			urlUtils.getFileDataFromFile = jest.fn(fileName => {
				return new Promise((resolve, reject) => {
					resolve(fileName)
				})
			})

			const expected = ["some data", "some more"]

			return expect(urlUtils.getFileDataFromQueryParam()).resolves.toEqual(expected)
		})

		it("should return the first filename rejected", () => {
			$location.search = jest.fn(() => {
				return { file: ["some data", "some more"] }
			})

			urlUtils.getFileDataFromFile = jest.fn(fileName => {
				return new Promise((resolve, reject) => {
					reject(fileName)
				})
			})

			const expected = "some data"

			return expect(urlUtils.getFileDataFromQueryParam()).rejects.toMatch(expected)
		})
	})

	describe("getFileDataFromFile", () => {
		it("should reject if file is not existing ", () => {
			return expect(urlUtils.getFileDataFromFile(null)).rejects.toEqual(undefined)
		})

		it("should reject if file length is 0 ", () => {
			return expect(urlUtils.getFileDataFromFile("")).rejects.toEqual(undefined)
		})

		it("should resolve data and return an object with content and fileName", () => {
			const expected = { content: "some data", fileName: "test.json" }
			return expect(urlUtils.getFileDataFromFile("test.json")).resolves.toEqual(expected)
		})

		it("should reject if statuscode is not 200", async () => {
			$http.get = jest.fn(file => {
				return new Promise((resolve, reject) => {
					resolve({ data: "some data", status: 201 })
				})
			})
			return expect(urlUtils.getFileDataFromFile("test.json")).rejects.toEqual(undefined)
		})
	})
})
