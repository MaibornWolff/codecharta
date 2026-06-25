import { of } from "rxjs"
import { UrlExtractor } from "./urlExtractor"
import { gzip } from "pako"
import { HttpClient } from "@angular/common/http"

describe("urlExtractor", () => {
    let urlExtractor: UrlExtractor
    let mockedHttpClient: HttpClient
    let originalLocation: Location

    beforeEach(() => {
        originalLocation = window.location
        delete (window as any).location
        ;(window as any).location = new URL("http://localhost")

        mockedHttpClient = {
            get: () => of({ body: { checksum: "fake-md5", data: { apiVersion: 1.3, nodes: [] } }, status: 200 })
        } as unknown as HttpClient

        urlExtractor = new UrlExtractor(mockedHttpClient)
    })

    afterEach(() => {
        ;(window as any).location = originalLocation
    })

    describe("getParameterByName", () => {
        it.todo("should return fileName for given parameter name 'file'") /*, () => {
            ;(window as any).location = new URL("http://testurl?file=valid.json")
            const result = urlExtractor.getParameterByName("file")
            expect(result).toBe("valid.json")
        })*/

        it.todo("should return null when parameter for renderMode is not given") /*, () => {
            ;(window as any).location = new URL("http://testurl?file=valid.json")
            const result = urlExtractor.getParameterByName("mode")
            expect(result).toBe(null)
        })*/

        it.todo("should return renderMode for given parameter name 'mode'") /*, () => {
            ;(window as any).location = new URL("http://testurl?file=valid.json&mode=Delta")
            const result = urlExtractor.getParameterByName("mode")
            expect(result).toBe("Delta")
        })*/

        it.todo("should return an empty string when no value is set for 'mode' parameter") /*, () => {
            ;(window as any).location = new URL("http://testurl?file=valid.json&mode=")
            const result = urlExtractor.getParameterByName("mode")
            expect(result).toBe("")
        })*/
    })

    describe("getFileDataFromQueryParam", () => {
        it.todo("should throw when file is undefined") /**, async () => {
            ;(window as any).location = new URL("http://testurl")
            await expect(urlExtractor.getFileDataFromQueryParam()).rejects.toThrow(new Error("Filename is missing"))
        })*/

        it.todo("should return the first filename rejected") /** , async () => {
            ;(window as any).location = new URL("http://testurl?file=some_file&file=some_other_file")

            urlExtractor.getFileDataFromFile = jest.fn(fileName => {
                throw new Error(fileName)
            })

        })*/
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
                fileSize: 15
            }
            return expect(urlExtractor.getFileDataFromFile("test.json")).resolves.toEqual(expected)
        })

        it("should resolve data object of version 1.3 and return an object with content and fileName", async () => {
            mockedHttpClient.get = jest.fn().mockImplementation(() => {
                return of({ body: { checksum: "", data: { apiVersion: 1.3, nodes: [] } }, status: 200 })
            })
            const expected = {
                content: { apiVersion: 1.3, fileChecksum: "e59723b38e81becf997a191ca8e4a169", nodes: [] },
                fileName: "test.json",
                fileSize: 15
            }
            return expect(urlExtractor.getFileDataFromFile("test.json")).resolves.toEqual(expected)
        })

        it("should resolve data from compressed file", async () => {
            const mockFile = {
                checksum: "fake-md5",
                data: { apiVersion: 1.3, nodes: [] }
            }
            const compressedSample = gzip(JSON.stringify(mockFile))

            mockedHttpClient.get = jest.fn().mockImplementation(() => {
                return of({ body: compressedSample, status: 200 })
            })
            const expected = {
                content: {
                    apiVersion: 1.3,
                    fileChecksum: "fake-md5",
                    nodes: []
                },
                fileName: "file.json.gz",
                fileSize: 13
            }
            const readContent = await urlExtractor.getFileDataFromFile("file.json.gz")
            expect(readContent).toEqual(expected)
        })

        it("should return NameDataPair object with project name as file name when a project name is given", async () => {
            mockedHttpClient.get = jest.fn().mockImplementation(() => {
                return of({
                    body: { checksum: "", data: { apiVersion: 1.3, nodes: [], projectName: "test project" } },
                    status: 200
                })
            })
            const actualNameDataPair = await urlExtractor.getFileDataFromFile("test.json")

            return expect(actualNameDataPair.fileName).toBe("test project")
        })

        it("should resolve data string of version 1.2 and return an object with content and fileName", async () => {
            mockedHttpClient.get = jest.fn().mockImplementation(() => {
                return of({ body: '{"apiVersion":1.2,"nodes":[]}', status: 200 })
            })
            const expected = {
                content: { apiVersion: 1.2, fileChecksum: "d0278536ce00e4fc7dbab39072ae43f6", nodes: [] },
                fileName: "test.json",
                fileSize: 15
            }
            return expect(urlExtractor.getFileDataFromFile("test.json")).resolves.toEqual(expected)
        })

        it("should resolve data object of version 1.2 and return an object with content and fileName", async () => {
            mockedHttpClient.get = jest.fn().mockImplementation(() => {
                return of({ body: { apiVersion: 1.2, nodes: [] }, status: 200 })
            })
            const expected = {
                content: { apiVersion: 1.2, fileChecksum: "d0278536ce00e4fc7dbab39072ae43f6", nodes: [] },
                fileName: "test.json",
                fileSize: 15
            }
            return expect(urlExtractor.getFileDataFromFile("test.json")).resolves.toEqual(expected)
        })

        it("should reject if statuscode is not 2xx", async () => {
            mockedHttpClient.get = jest.fn().mockImplementation(() => {
                return of({ body: "some data", status: 301 })
            })

            return expect(urlExtractor.getFileDataFromFile("test.json")).rejects.toEqual(new Error(`Could not load file "test.json"`))
        })
    })
})
