import { TestBed } from "@angular/core/testing"
import { ChangelogParserService } from "./changelogParser.service"

describe("ChangelogParserService", () => {
    let service: ChangelogParserService

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ChangelogParserService]
        })
        service = TestBed.inject(ChangelogParserService)
    })

    describe("parseChangesBetweenVersions", () => {
        it("should parse changes between two versions", () => {
            // Arrange
            const previousVersion = "1.75.0"
            const currentVersion = "1.76.0"

            // Act
            const result = service.parseChangesBetweenVersions(previousVersion, currentVersion)

            // Assert
            expect(result.length).toBeGreaterThan(0)
        })

        it("should return empty array when version not found", () => {
            // Arrange
            const previousVersion = "0.0.0"
            const currentVersion = "0.0.1"

            // Act
            const result = service.parseChangesBetweenVersions(previousVersion, currentVersion)

            // Assert
            expect(result).toEqual([])
        })

        it("should include multiple versions when parsing range", () => {
            // Arrange
            const previousVersion = "1.75.0"
            const currentVersion = "1.77.0"

            // Act
            const result = service.parseChangesBetweenVersions(previousVersion, currentVersion)

            // Assert
            expect(result.length).toBeGreaterThan(0)
        })

        it("should return no changes when every version in the range has an empty section", () => {
            // Arrange
            const previousVersion = "1.77.0"
            const currentVersion = "1.78.0"

            // Act
            const result = service.parseChangesBetweenVersions(previousVersion, currentVersion)

            // Assert
            expect(result).toEqual([])
        })

        it("should skip an empty version section and keep the changes of the versions below it", () => {
            // Arrange
            const previousVersion = "1.76.0"
            const currentVersion = "1.78.0"

            // Act
            const result = service.parseChangesBetweenVersions(previousVersion, currentVersion)

            // Assert
            expect(result.map(category => category.title)).toEqual(["Fixed", "Chore"])
        })

        it("should recognise a category heading written without its emoji", () => {
            // Arrange
            const previousVersion = "1.75.0"
            const currentVersion = "1.76.0"

            // Act
            const result = service.parseChangesBetweenVersions(previousVersion, currentVersion)

            // Assert
            expect(result.find(category => category.title === "Removed")?.changes).toContain("<li>14</li>")
        })
    })
})
