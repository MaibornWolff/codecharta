import { Float32BufferAttribute, Mesh } from "three"
import { Volume, exportedForTesting } from "./serialize3mf.service"

describe("serialize3mf service", () => {
    describe("constructVolume", () => {
        const { constructVolume } = exportedForTesting

        let volumes: Volume[]
        let colorToExtruder: Map<string, number>
        let childMesh: Mesh
        const volumeCount = 1

        beforeEach(() => {
            volumes = []
            colorToExtruder = new Map<string, number>()
            childMesh = new Mesh()
            childMesh.name = "TestMesh"
        })

        it("should add new colors to the extruder map if not present", () => {
            const color1 = "FFBEAF"
            const color2 = "FFDEAD"
            constructVolume(childMesh, color1, 0, 42, volumes, volumeCount, colorToExtruder)
            constructVolume(childMesh, color2, 43, 45, volumes, volumeCount, colorToExtruder)

            expect(volumes).toHaveLength(2)
            expect(colorToExtruder.size).toBe(2)
            expect(colorToExtruder.get(color1)).toBe(1)
            expect(colorToExtruder.get(color2)).toBe(2)
            expect(volumes[0].extruder).toBe(1)
            expect(volumes[1].extruder).toBe(2)
        })

        it("should not add color to the extruder if already present", () => {
            const color1 = "FFBEAF"
            constructVolume(childMesh, color1, 0, 42, volumes, volumeCount, colorToExtruder)
            constructVolume(childMesh, color1, 43, 45, volumes, volumeCount, colorToExtruder)

            expect(volumes).toHaveLength(2)
            expect(colorToExtruder.size).toBe(1)
            expect(colorToExtruder.get(color1)).toBe(1)
            expect(volumes[0].extruder).toBe(1)
            expect(volumes[1].extruder).toBe(1)
        })

        it("should set volumeName according to the schema", () => {
            childMesh.name = "Map"
            const otherMesh = new Mesh()
            const otherMeshName = "otherName"
            otherMesh.name = otherMeshName

            constructVolume(childMesh, "C0FFEE", 0, 42, volumes, volumeCount, colorToExtruder)
            constructVolume(otherMesh, "C0FFEE", 43, 45, volumes, volumeCount, colorToExtruder)

            expect(volumes).toHaveLength(2)
            expect(volumes[0].name).toBe("Map 0xC0FFEE")
            expect(volumes[1].name).toBe(otherMeshName)
        })

        it("should set all properties as expected", () => {
            const otherMesh = new Mesh()
            otherMesh.name = "Map"

            constructVolume(childMesh, "C0FFEE", 0, 42, volumes, volumeCount, colorToExtruder)
            constructVolume(otherMesh, "C0FFEE", 43, 45, volumes, volumeCount, colorToExtruder)

            expect(volumes).toHaveLength(2)
            expect(volumes[1].id).toBe(volumeCount)
            expect(volumes[1].name).toBe("Map 0xC0FFEE")
            expect(volumes[1].color).toBe("C0FFEE")
            expect(volumes[1].extruder).toBe(1)
            expect(volumes[1].firstTriangleId).toBe(43)
            expect(volumes[1].lastTriangleId).toBe(45)
        })
    })

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
