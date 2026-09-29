import { isWithin } from "./boxPaths"

describe("isWithin", () => {
    it("should count a path within itself and within every folder above it", () => {
        // Arrange
        const path = "/root/app/a.ts"

        // Act
        const within = ["/root/app/a.ts", "/root/app", "/root"].map(folderPath => isWithin(path, folderPath))

        // Assert
        expect(within).toEqual([true, true, true])
    })

    it("should not count a path within a sibling that merely starts with the same name", () => {
        // Arrange
        const path = "/root/application.ts"

        // Act
        const within = isWithin(path, "/root/app")

        // Assert
        expect(within).toBe(false)
    })

    it("should not count a folder within its own children", () => {
        // Arrange
        const folderPath = "/root/app"

        // Act
        const within = isWithin(folderPath, "/root/app/a.ts")

        // Assert
        expect(within).toBe(false)
    })
})
