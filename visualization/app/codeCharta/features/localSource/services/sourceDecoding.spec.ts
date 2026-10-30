import { decodeSource } from "./sourceDecoding"

describe("decodeSource", () => {
    it("should decode valid UTF-8", () => {
        // Arrange
        const bytes = new TextEncoder().encode("Grüße")

        // Act
        const decoded = decodeSource(bytes)

        // Assert
        expect(decoded).toEqual({ text: "Grüße", encoding: "UTF-8" })
    })

    it("should decode text that is not valid UTF-8 in the older Western encoding and say so", () => {
        // Arrange
        const bytes = new Uint8Array([0x47, 0x72, 0xfc, 0xdf, 0x65])

        // Act
        const decoded = decodeSource(bytes)

        // Assert
        expect(decoded).toEqual({ text: "Grüße", encoding: "Windows-1252" })
    })

    it.each([
        { bytes: [0xff, 0xfe, 0x48, 0x00, 0x69, 0x00], encoding: "UTF-16 LE" },
        { bytes: [0xfe, 0xff, 0x00, 0x48, 0x00, 0x69], encoding: "UTF-16 BE" }
    ])("should decode $encoding by its byte order mark", ({ bytes, encoding }) => {
        // Act
        const decoded = decodeSource(new Uint8Array(bytes))

        // Assert
        expect(decoded).toEqual({ text: "Hi", encoding })
    })

    it("should treat a file with a NUL byte as not being text", () => {
        // Arrange
        const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x00, 0x01])

        // Act
        const decoded = decodeSource(bytes)

        // Assert
        expect(decoded).toBeNull()
    })
})
