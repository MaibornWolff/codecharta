import { HttpClient } from "@angular/common/http"
import { createHash } from "crypto"
import { gzip } from "pako"
import { of } from "rxjs"
import { UrlExtractor } from "./urlExtractor"

const bytesOf = (text: string) => new TextEncoder().encode(text)
const sha256Of = (text: string) => createHash("sha256").update(text).digest("hex")
const responseOf = (bytes: Uint8Array, status = 200) =>
    of({ body: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), status })

describe("urlExtractor", () => {
    let urlExtractor: UrlExtractor
    let mockedHttpClient: HttpClient
    let originalLocation: Location

    beforeEach(() => {
        originalLocation = window.location
        delete (window as any).location
        ;(window as any).location = new URL("http://localhost")

        mockedHttpClient = {
            get: jest.fn(() => responseOf(bytesOf('{"checksum":"fake-md5","data":{"apiVersion":1.3,"nodes":[]}}')))
        } as unknown as HttpClient

        urlExtractor = new UrlExtractor(mockedHttpClient)
    })

    afterEach(() => {
        ;(window as any).location = originalLocation
    })

    describe("getFileDataFromFileNames", () => {
        it.todo("should throw when file is undefined") /**, async () => {
            ;(window as any).location = new URL("http://testurl")
            await expect(urlExtractor.getFileDataFromFileNames([])).rejects.toThrow(new Error("Filename is missing"))
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

        it("should request the file as bytes", async () => {
            // Act
            await urlExtractor.getFileDataFromFile("test.json")

            // Assert
            expect(mockedHttpClient.get).toHaveBeenCalledWith("test.json", { responseType: "arraybuffer", observe: "response" })
        })

        it("should resolve a wrapped 1.3 file with its checksum and byte size", async () => {
            // Arrange
            const text = '{"checksum":"fake-md5","data":{"apiVersion":1.3,"nodes":[]}}'

            // Act
            const nameDataPair = await urlExtractor.getFileDataFromFile("test.json")

            // Assert
            expect(nameDataPair).toEqual({
                content: { apiVersion: 1.3, fileChecksum: "fake-md5", nodes: [] },
                fileName: "test.json",
                fileSize: bytesOf(text).byteLength
            })
        })

        it("should fill a missing checksum with the SHA-256 of the file", async () => {
            // Arrange
            const text = '{"apiVersion":1.2,"nodes":[]}'
            mockedHttpClient.get = jest.fn().mockImplementation(() => responseOf(bytesOf(text)))

            // Act
            const nameDataPair = await urlExtractor.getFileDataFromFile("test.json")

            // Assert
            expect(nameDataPair.content).toEqual({ apiVersion: 1.2, fileChecksum: sha256Of(text), nodes: [] })
        })

        it("should resolve a gzipped file with its compressed byte size", async () => {
            // Arrange
            const compressedFile = gzip('{"checksum":"fake-md5","data":{"apiVersion":1.3,"nodes":[]}}')
            mockedHttpClient.get = jest.fn().mockImplementation(() => responseOf(compressedFile))

            // Act
            const nameDataPair = await urlExtractor.getFileDataFromFile("file.json.gz")

            // Assert
            expect(nameDataPair).toEqual({
                content: { apiVersion: 1.3, fileChecksum: "fake-md5", nodes: [] },
                fileName: "file.json.gz",
                fileSize: compressedFile.byteLength
            })
        })

        it("should return NameDataPair object with project name as file name when a project name is given", async () => {
            // Arrange
            mockedHttpClient.get = jest
                .fn()
                .mockImplementation(() =>
                    responseOf(bytesOf('{"checksum":"","data":{"apiVersion":1.3,"nodes":[],"projectName":"test project"}}'))
                )

            // Act
            const nameDataPair = await urlExtractor.getFileDataFromFile("test.json")

            // Assert
            expect(nameDataPair.fileName).toBe("test project")
        })

        it("should keep the requested file name and hand over no content when the file is not valid JSON", async () => {
            // Arrange
            mockedHttpClient.get = jest.fn().mockImplementation(() => responseOf(bytesOf("broken json")))

            // Act
            const nameDataPair = await urlExtractor.getFileDataFromFile("folder/test.json")

            // Assert
            expect(nameDataPair).toEqual({ content: null, fileName: "test.json", fileSize: bytesOf("broken json").byteLength })
        })

        it("should reject if statuscode is not 2xx", async () => {
            mockedHttpClient.get = jest.fn().mockImplementation(() => responseOf(bytesOf("some data"), 301))

            return expect(urlExtractor.getFileDataFromFile("test.json")).rejects.toEqual(new Error(`Could not load file "test.json"`))
        })
    })
})
