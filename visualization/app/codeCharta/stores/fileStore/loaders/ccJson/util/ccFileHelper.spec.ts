import { createHash } from "crypto"
import { gzip } from "pako"
import { TEST_ATTRIBUTE_DESCRIPTORS_HALF_FILLED, TEST_FILE_CONTENT } from "../../../../../mocks/dataMocks"
import { ExportBlacklistType, ExportCCFile, NameDataPair } from "../../../../../model/codeCharta.api.model"
import { AttributeTypeValue } from "../../../../../model/codeCharta.model"
import { clone } from "../../../../../util/clone"
import { parseGameObjectsFile } from "../../gameObjects/gameObjectsImporter"
import { TEST_GAMEOBJECTS_FILE } from "../../gameObjects/gameObjectsMocks"
import { getCCFile, parseCcFileBytes } from "./ccFileHelper"

const bytesOf = (text: string) => new TextEncoder().encode(text)
const sha256Of = (text: string) => createHash("sha256").update(text).digest("hex")

describe("ccFileHelper", () => {
    let fileContent: ExportCCFile

    beforeEach(() => {
        fileContent = clone(TEST_FILE_CONTENT)
    })

    describe("getCCFile", () => {
        it("should build a CCFile", () => {
            const nameDataPair: NameDataPair = { content: fileContent, fileName: "fileName", fileSize: 30 }
            const result = getCCFile(nameDataPair)

            expect(result).toMatchSnapshot()
        })

        it("should convert old blacklist type", () => {
            fileContent.blacklist = [{ path: "foo", type: ExportBlacklistType.exclude }]

            const nameDataPair: NameDataPair = { content: fileContent, fileName: "fileName", fileSize: 30 }
            const result = getCCFile(nameDataPair)

            expect(result.settings.fileSettings.blacklist).toEqual([{ path: "foo", type: "exclude" }])
        })

        it("should ignore old attribute types", () => {
            fileContent.attributeTypes = {
                nodes: [{ mcc: AttributeTypeValue.absolute }],
                edges: [{ pairingRate: AttributeTypeValue.relative }]
            }

            const nameDataPair: NameDataPair = { content: fileContent, fileName: "fileName", fileSize: 30 }
            const result = getCCFile(nameDataPair)

            expect(result.settings.fileSettings.attributeTypes).toEqual({ nodes: {}, edges: {} })
        })

        it("should return empty attributeTypes", () => {
            fileContent.attributeTypes = {}

            const nameDataPair: NameDataPair = { content: fileContent, fileName: "fileName", fileSize: 30 }
            const result = getCCFile(nameDataPair)

            expect(result.settings.fileSettings.attributeTypes).toEqual({ nodes: {}, edges: {} })
        })

        it("should return empty attributeTypes if the property doesn't exist", () => {
            fileContent.attributeTypes = undefined

            const nameDataPair: NameDataPair = { content: fileContent, fileName: "fileName", fileSize: 30 }
            const result = getCCFile(nameDataPair)

            expect(result.settings.fileSettings.attributeTypes).toEqual({ nodes: {}, edges: {} })
        })

        it("should return attributeTypes if nodes exist", () => {
            fileContent.attributeTypes = {
                nodes: { test: AttributeTypeValue.absolute },
                edges: {}
            }

            const nameDataPair: NameDataPair = { content: fileContent, fileName: "fileName", fileSize: 30 }
            const result = getCCFile(nameDataPair)

            expect(result.settings.fileSettings.attributeTypes).toEqual({
                nodes: { test: AttributeTypeValue.absolute },
                edges: {}
            })
        })

        it("should return attributeTypes if nodes exist", () => {
            fileContent.attributeDescriptors = TEST_ATTRIBUTE_DESCRIPTORS_HALF_FILLED

            const nameDataPair: NameDataPair = { content: fileContent, fileName: "fileName", fileSize: 30 }
            const result = getCCFile(nameDataPair)

            expect(result.settings.fileSettings.attributeDescriptors).toEqual(TEST_ATTRIBUTE_DESCRIPTORS_HALF_FILLED)
        })
    })

    describe("parseCcFileBytes", () => {
        afterEach(() => {
            jest.restoreAllMocks()
        })

        it("should leave a missing checksum empty when the browser offers no Web Crypto", async () => {
            // Arrange
            jest.replaceProperty(globalThis.crypto, "subtle", undefined as unknown as SubtleCrypto)

            // Act
            const content = await parseCcFileBytes(bytesOf('{"checksum":"","data":{"apiVersion":"1.3"}}'))

            // Assert
            expect(content).toEqual({ apiVersion: "1.3", fileChecksum: "" })
        })

        it("should unwrap a 1.3 file and fill its missing checksum with the SHA-256 of its bytes", async () => {
            // Arrange
            const text = '{"checksum":"","data":{"apiVersion":"1.3"}}'

            // Act
            const content = await parseCcFileBytes(bytesOf(text))

            // Assert
            expect(content).toEqual({ apiVersion: "1.3", fileChecksum: sha256Of(text) })
        })

        it("should keep the checksum a wrapped 1.3 file carries", async () => {
            // Arrange
            const text = '{"checksum":"fake-checksum","data":{"apiVersion":"1.3"}}'

            // Act
            const content = await parseCcFileBytes(bytesOf(text))

            // Assert
            expect(content).toEqual({ apiVersion: "1.3", fileChecksum: "fake-checksum" })
        })

        it("should fill the missing checksum of a file before 1.3", async () => {
            // Arrange
            const text = '{"apiVersion":"1.2"}'

            // Act
            const content = await parseCcFileBytes(bytesOf(text))

            // Assert
            expect(content).toEqual({ apiVersion: "1.2", fileChecksum: sha256Of(text) })
        })

        it("should keep the checksum a file before 1.3 carries", async () => {
            // Arrange
            const text = '{"fileChecksum":"fake-checksum","apiVersion":"1.2"}'

            // Act
            const content = await parseCcFileBytes(bytesOf(text))

            // Assert
            expect(content).toEqual({ apiVersion: "1.2", fileChecksum: "fake-checksum" })
        })

        it("should fill the missing checksum of a 2.0 file", async () => {
            // Arrange
            const text = '{"meta":{"projectName":"p","apiVersion":"2.0","checksum":""},"files":[]}'

            // Act
            const content = await parseCcFileBytes(bytesOf(text))

            // Assert
            expect(content).toEqual({ meta: { projectName: "p", apiVersion: "2.0", checksum: sha256Of(text) }, files: [] })
        })

        it("should keep the checksum a 2.0 file carries", async () => {
            // Arrange
            const text = '{"meta":{"projectName":"p","apiVersion":"2.0","checksum":"fake-checksum"},"files":[]}'

            // Act
            const content = await parseCcFileBytes(bytesOf(text))

            // Assert
            expect(content).toEqual({ meta: { projectName: "p", apiVersion: "2.0", checksum: "fake-checksum" }, files: [] })
        })

        it("should read gzipped bytes as the file they contain", async () => {
            // Arrange
            const text = '{"apiVersion":"1.2"}'

            // Act
            const content = await parseCcFileBytes(gzip(text))

            // Assert
            expect(content).toEqual({ apiVersion: "1.2", fileChecksum: sha256Of(text) })
        })

        it("should convert a gameObjects file into a cc.json file checksummed by its own bytes", async () => {
            // Arrange
            const text = JSON.stringify(TEST_GAMEOBJECTS_FILE)
            const { data: convertedFile } = parseGameObjectsFile(clone(TEST_GAMEOBJECTS_FILE))

            // Act
            const content = await parseCcFileBytes(bytesOf(text))

            // Assert
            expect(content).toEqual({ ...convertedFile, fileChecksum: sha256Of(text) })
        })

        it.each([
            ["not valid JSON", "broken json"],
            ["not a JSON object", "42"]
        ])("should return null when the bytes are %s", async (_, text) => {
            // Arrange
            const bytes = bytesOf(text)

            // Act
            const content = await parseCcFileBytes(bytes)

            // Assert
            expect(content).toBeNull()
        })
    })
})
