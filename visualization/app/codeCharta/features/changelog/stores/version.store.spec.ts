import { TestBed } from "@angular/core/testing"
import { VersionStore } from "./version.store"

describe("VersionStore", () => {
    let store: VersionStore

    beforeEach(() => {
        localStorage.clear()
        TestBed.configureTestingModule({
            providers: [VersionStore]
        })
        store = TestBed.inject(VersionStore)
    })

    afterEach(() => {
        localStorage.clear()
    })

    describe("getSavedVersion", () => {
        it("should return null when no version is saved", () => {
            // Act
            const result = store.getSavedVersion()

            // Assert
            expect(result).toBeNull()
        })

        it("should return saved version from localStorage", () => {
            // Arrange
            localStorage.setItem("codeChartaVersion", "1.0.0")

            // Act
            const result = store.getSavedVersion()

            // Assert
            expect(result).toBe("1.0.0")
        })
    })

    describe("saveCurrentVersion", () => {
        it("should save current version to localStorage", () => {
            // Act
            store.saveCurrentVersion()

            // Assert
            expect(localStorage.getItem("codeChartaVersion")).toBe(store.currentVersion)
        })
    })

    describe("setPreviousVersion", () => {
        it("should update previousVersion signal", () => {
            // Act
            store.setPreviousVersion("1.0.0")

            // Assert
            expect(store.previousVersion()).toBe("1.0.0")
        })
    })

    describe("setShouldShowChangelog", () => {
        it("should update shouldShowChangelog signal", () => {
            // Act
            store.setShouldShowChangelog(true)

            // Assert
            expect(store.shouldShowChangelog()).toBe(true)
        })
    })
})
