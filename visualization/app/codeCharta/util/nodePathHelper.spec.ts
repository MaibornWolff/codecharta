import { getTopLevelMapName } from "./nodePathHelper"

describe("getTopLevelMapName", () => {
    it("should return the first path segment below the root", () => {
        // Arrange
        const path = "/root/map-a.cc.json/src/main/file.ts"

        // Act
        const result = getTopLevelMapName(path)

        // Assert
        expect(result).toBe("map-a.cc.json")
    })

    it("should return the map name for a direct child of the root", () => {
        // Arrange
        const path = "/root/map-a.cc.json"

        // Act
        const result = getTopLevelMapName(path)

        // Assert
        expect(result).toBe("map-a.cc.json")
    })

    it("should return the path unchanged when it is not below the root", () => {
        // Arrange
        const path = "some/other/path"

        // Act
        const result = getTopLevelMapName(path)

        // Assert
        expect(result).toBe("some/other/path")
    })
})
