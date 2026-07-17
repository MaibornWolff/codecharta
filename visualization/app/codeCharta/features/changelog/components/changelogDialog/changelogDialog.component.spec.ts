import { signal, WritableSignal } from "@angular/core"
import { ComponentFixture, TestBed } from "@angular/core/testing"
import { ChangelogParserService } from "../../services/changelogParser.service"
import { VersionService } from "../../services/version.service"
import { ChangelogDialogComponent } from "./changelogDialog.component"

describe("ChangelogDialogComponent", () => {
    let component: ChangelogDialogComponent
    let fixture: ComponentFixture<ChangelogDialogComponent>
    let mockVersionService: {
        currentVersion: string
        previousVersion: WritableSignal<string | null>
        shouldShowChangelog: WritableSignal<boolean>
        acknowledgeChangelog: jest.Mock
    }
    let mockChangelogParserService: {
        parseChangesBetweenVersions: jest.Mock
    }

    beforeEach(async () => {
        mockVersionService = {
            currentVersion: "1.77.0",
            previousVersion: signal<string | null>("1.76.0"),
            shouldShowChangelog: signal(false),
            acknowledgeChangelog: jest.fn()
        }
        mockChangelogParserService = {
            parseChangesBetweenVersions: jest.fn().mockReturnValue([{ title: "Added 🚀", changes: "<li>New feature</li>" }])
        }

        await TestBed.configureTestingModule({
            imports: [ChangelogDialogComponent],
            providers: [
                { provide: VersionService, useValue: mockVersionService },
                { provide: ChangelogParserService, useValue: mockChangelogParserService }
            ]
        }).compileComponents()

        fixture = TestBed.createComponent(ChangelogDialogComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it("should create", () => {
        // Assert
        expect(component).toBeTruthy()
    })

    it("should compute changes from facade", () => {
        // Arrange & Act
        const changes = component.changes()

        // Assert
        expect(changes).toEqual([{ title: "Added 🚀", changes: "<li>New feature</li>" }])
        expect(mockChangelogParserService.parseChangesBetweenVersions).toHaveBeenCalledWith("1.76.0", "1.77.0")
    })

    it("should have dialog element", () => {
        // Arrange & Act
        const dialogElement = component.dialogElement()

        // Assert
        expect(dialogElement).toBeTruthy()
    })

    it("should open dialog when open() is called", () => {
        // Arrange
        const mockShowModal = jest.fn()
        component.dialogElement().nativeElement.showModal = mockShowModal

        // Act
        component.open()

        // Assert
        expect(mockShowModal).toHaveBeenCalled()
    })

    it("should close dialog and acknowledge when close() is called", () => {
        // Arrange
        const mockClose = jest.fn()
        component.dialogElement().nativeElement.close = mockClose

        // Act
        component.close()

        // Assert
        expect(mockVersionService.acknowledgeChangelog).toHaveBeenCalled()
        expect(mockClose).toHaveBeenCalled()
    })

    it("should return empty changes when no previous version", () => {
        // Arrange
        mockVersionService.previousVersion.set(null)
        fixture.detectChanges()

        // Act
        const changes = component.changes()

        // Assert
        expect(changes).toEqual([])
    })
})
