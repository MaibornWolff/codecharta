import { parseJsonBytes } from "./jsonBytes"

const bytesOf = (text: string) => new TextEncoder().encode(text)
const SMALL_SLICE_BYTES = 8

describe("jsonBytes", () => {
    describe("parseJsonBytes", () => {
        it("should parse bytes that fit in one slice like JSON.parse", () => {
            // Arrange
            const json = '{"meta":{"apiVersion":"2.0"},"files":[1,2,3]}'

            // Act
            const parsed = parseJsonBytes(bytesOf(json))

            // Assert
            expect(parsed).toEqual(JSON.parse(json))
        })

        it("should parse nested objects and arrays larger than a slice piece by piece", () => {
            // Arrange
            const json =
                ' { "lenses" : { "domain" : { "nodes" : { "a" : { "words" : [ {"text":"order","frequency":3}, {"text":"invoice","frequency":1} ] } } } }, "files" : [ [1, 2], {"id":"x"}, null, true, -1.5e3 ] } '

            // Act
            const parsed = parseJsonBytes(bytesOf(json), SMALL_SLICE_BYTES)

            // Assert
            expect(parsed).toEqual(JSON.parse(json))
        })

        it("should keep structural characters and escapes inside strings intact", () => {
            // Arrange
            const json = String.raw`{"we{ird,key:":["a,b]}","quote\"inside:{","back\\slash\\","über 日本 é"],"k\"2":"}]"}`

            // Act
            const parsed = parseJsonBytes(bytesOf(json), SMALL_SLICE_BYTES)

            // Assert
            expect(parsed).toEqual(JSON.parse(json))
        })

        it("should parse empty objects and arrays larger than a slice", () => {
            // Arrange
            const json = '{"object":{          },"array":[          ]}'

            // Act
            const parsed = parseJsonBytes(bytesOf(json), SMALL_SLICE_BYTES)

            // Assert
            expect(parsed).toEqual({ object: {}, array: [] })
        })

        it("should keep a __proto__ key as an own property", () => {
            // Arrange
            const json = '{"__proto__":{"polluted":true},"other":[1,2,3]}'

            // Act
            const parsed = parseJsonBytes(bytesOf(json), SMALL_SLICE_BYTES) as Record<string, unknown>

            // Assert
            expect(Object.keys(parsed)).toEqual(["__proto__", "other"])
            expect(({} as Record<string, unknown>).polluted).toBeUndefined()
        })

        it.each([
            ["an unterminated string", '{"key":"value'],
            ["a trailing comma", '{"key":[1,2,3],}'],
            ["a mismatched closing bracket", '{"key":[1,2,3]]'],
            ["a missing colon", '{"key" [1,2,3]}'],
            ["an unquoted key", "{key:[1,2,3,4]}"]
        ])("should throw a SyntaxError on %s larger than a slice", (_, json) => {
            // Arrange
            const bytes = bytesOf(json)

            // Act
            const parse = () => parseJsonBytes(bytes, SMALL_SLICE_BYTES)

            // Assert
            expect(parse).toThrow(SyntaxError)
        })
    })
})
