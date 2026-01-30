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
    })
})
