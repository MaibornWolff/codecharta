import { getService } from "../../../mocks/ng.mockhelper"
import { ILocationService, IHttpService } from "angular"
import { UrlExtractor } from "./urlExtractor"
import sample1 from "../assets/sample1.cc.json"
import zlib from "zlib"

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
			return { data: '{"checksum": "fake-md5", "data": {"apiVersion": 1.3, "nodes": []}}', status: 200 }
		})
	}

	describe("getParameterByName", () => {
		it("should return fileName for given parameter name 'file'", () => {
			const result = urlExtractor.getParameterByName("file")
			expect(result).toBe("valid.json")
		})

		it("should return null when parameter for renderMode is not given", () => {
			const result = urlExtractor.getParameterByName("mode")
			expect(result).toBe(null)
		})

		it("should return renderMode for given parameter name 'mode'", () => {
			$location.absUrl = jest.fn(() => {
				return "http://testurl?file=valid.json&mode=Delta"
			})
			const result = urlExtractor.getParameterByName("mode")
			expect(result).toBe("Delta")
		})

		it("should return an empty string when no value is set for 'mode' parameter", () => {
			$location.absUrl = jest.fn(() => {
				return "http://testurl?file=valid.json&mode="
			})
			const result = urlExtractor.getParameterByName("mode")
			expect(result).toBe("")
		})
	})

	describe("getFileDataFromQueryParam", () => {
		it("should throw when file is undefined", async () => {
			$location.search = jest.fn().mockReturnValue({ file: undefined })
			await expect(urlExtractor.getFileDataFromQueryParam()).rejects.toThrow(new Error(`Filename is missing`))
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

		it("should resolve data string of version 1.3 and return an object with content and fileName", async () => {
			const expected = {
				content: { apiVersion: 1.3, fileChecksum: "fake-md5", nodes: [] },
				fileName: "test.json",
				fileSize: 66
			}
			return expect(urlExtractor.getFileDataFromFile("test.json")).resolves.toEqual(expected)
		})

		it("should resolve data object of version 1.3 and return an object with content and fileName", async () => {
			$http.get = jest.fn().mockImplementation(async () => {
				return { data: { checksum: "", data: { apiVersion: 1.3, nodes: [] } }, status: 200 }
			})
			const expected = {
				content: { apiVersion: 1.3, fileChecksum: "e59723b38e81becf997a191ca8e4a169", nodes: [] },
				fileName: "test.json",
				fileSize: 15
			}
			return expect(urlExtractor.getFileDataFromFile("test.json")).resolves.toEqual(expected)
		})

		it("should resolve data from compressed file", async () => {
			/*const mockBlobData =
					{
						checksum: "fake-md5",
						data: {apiVersion: 1.3, nodes: []}
					}*/

			const compressedSample = zlib.gzipSync(JSON.stringify(sample1))

			$location.absUrl = jest.fn(() => {
				return "http://testurl?file=file.json.gz"
			})
			$http.get = jest.fn().mockImplementation(async () => {
				return { data: new Blob([compressedSample]), status: 200 }
			})
			const expected = {
				content: {
					apiVersion: 1.3,
					fileChecksum: "99914b932bd37a50b983c5e7c90ae93b",
					nodes: []
				},
				fileName: "file.json.gz",
				fileSize: 13
			}
			const readContent = await urlExtractor.getFileDataFromFile("file.json.gz")
			expect(readContent).toBe(expected)
		})

		it("should return NameDataPair object with project name as file name when a project name is given", async () => {
			$http.get = jest.fn().mockImplementation(async () => {
				return {
					data: { checksum: "", data: { apiVersion: 1.3, nodes: [], projectName: "test project" } },
					status: 200
				}
			})
			const actualNameDataPair = await urlExtractor.getFileDataFromFile("test.json")

			return expect(actualNameDataPair.fileName).toBe("test project")
		})

		it("should resolve data string of version 1.2 and return an object with content and fileName", async () => {
			$http.get = jest.fn().mockImplementation(async () => {
				return { data: '{"apiVersion":1.2,"nodes":[]}', status: 200 }
			})
			const expected = {
				content: { apiVersion: 1.2, fileChecksum: "d0278536ce00e4fc7dbab39072ae43f6", nodes: [] },
				fileName: "test.json",
				fileSize: 29
			}
			return expect(urlExtractor.getFileDataFromFile("test.json")).resolves.toEqual(expected)
		})

		it("should resolve data object of version 1.2 and return an object with content and fileName", async () => {
			$http.get = jest.fn().mockImplementation(async () => {
				return { data: { apiVersion: 1.2, nodes: [] }, status: 200 }
			})
			const expected = {
				content: { apiVersion: 1.2, fileChecksum: "d0278536ce00e4fc7dbab39072ae43f6", nodes: [] },
				fileName: "test.json",
				fileSize: 15
			}
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
