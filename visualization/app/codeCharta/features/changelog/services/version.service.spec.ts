import { TestBed } from "@angular/core/testing"
import { VersionService } from "./version.service"
import { VersionStore } from "../stores/version.store"
import { signal } from "@angular/core"

describe("VersionService", () => {
    let service: VersionService
    let mockStore: {
        currentVersion: string
        previousVersion: ReturnType<typeof signal<string | null>>
        shouldShowChangelog: ReturnType<typeof signal<boolean>>
        getSavedVersion: jest.Mock
        saveCurrentVersion: jest.Mock
        setPreviousVersion: jest.Mock
        setShouldShowChangelog: jest.Mock
    }

    beforeEach(() => {
        mockStore = {
            currentVersion: "1.0.0",
            previousVersion: signal<string | null>(null),
            shouldShowChangelog: signal(false),
            getSavedVersion: jest.fn(),
            saveCurrentVersion: jest.fn(),
            setPreviousVersion: jest.fn(),
            setShouldShowChangelog: jest.fn()
        }

        TestBed.configureTestingModule({
            providers: [VersionService, { provide: VersionStore, useValue: mockStore }]
        })
        service = TestBed.inject(VersionService)
    })

    describe("synchronizeVersion", () => {
        it("should save version on first use when no saved version exists", () => {
            // Arrange
            mockStore.getSavedVersion.mockReturnValue(null)

            // Act
            service.synchronizeVersion()

            // Assert
            expect(mockStore.saveCurrentVersion).toHaveBeenCalled()
            expect(mockStore.setShouldShowChangelog).not.toHaveBeenCalledWith(true)
        })

        it("should show changelog when saved version is older", () => {
            // Arrange
            mockStore.getSavedVersion.mockReturnValue("0.9.0")

            // Act
            service.synchronizeVersion()

            // Assert
            expect(mockStore.setPreviousVersion).toHaveBeenCalledWith("0.9.0")
            expect(mockStore.setShouldShowChangelog).toHaveBeenCalledWith(true)
            expect(mockStore.saveCurrentVersion).toHaveBeenCalled()
        })

        it("should not show changelog when saved version is same", () => {
            // Arrange
            mockStore.getSavedVersion.mockReturnValue("1.0.0")

            // Act
            service.synchronizeVersion()

            // Assert
            expect(mockStore.setShouldShowChangelog).not.toHaveBeenCalledWith(true)
        })

        it("should not show changelog when saved version is newer", () => {
            // Arrange
            mockStore.getSavedVersion.mockReturnValue("2.0.0")

            // Act
            service.synchronizeVersion()

            // Assert
            expect(mockStore.setShouldShowChangelog).not.toHaveBeenCalledWith(true)
        })
    })

    describe("acknowledgeChangelog", () => {
        it("should set shouldShowChangelog to false", () => {
            // Act
            service.acknowledgeChangelog()

            // Assert
            expect(mockStore.setShouldShowChangelog).toHaveBeenCalledWith(false)
        })
    })
})
