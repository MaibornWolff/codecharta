import { Float32BufferAttribute } from "three"
import { exportedForTesting } from "./serialize3mf.service"

describe("serialize3mf service", () => {
    describe("convertColorArrayToHexString", () => {
        const { convertColorArrayToHexString } = exportedForTesting
        const inputNumbers = [0, 0, 1, 0, 1, 0, 1, 0, 0, 0.3, 0.3, 0.3, 0.5, 0.5, 0, 0, 0.5, 0.5]
        const floatBufferNumbers = new Float32Array(inputNumbers)
        const floatBuffer = new Float32BufferAttribute(floatBufferNumbers, 3, false)

        const indicies = [0, 1, 2, 3, 4, 5]
        const outputColours = ["0000ff", "00ff00", "ff0000", "4d4d4d", "808000", "008080"]

        it.each(indicies)("should convert number arrays to colors", index => {
            expect(convertColorArrayToHexString(inputNumbers, index * 3)).toBe(outputColours[index])
        })

        it.each(indicies)("should convert Float32BufferAttribute to colors", index => {
            expect(convertColorArrayToHexString(floatBuffer, index)).toBe(outputColours[index])
        })
    })
})
