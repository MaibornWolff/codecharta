import { ComponentFixture, TestBed } from "@angular/core/testing"
import { ChangelogDialogComponent } from "./changelogDialog.component"
import { ChangelogFacade } from "../../facade"
import { signal, WritableSignal } from "@angular/core"

describe("ChangelogDialogComponent", () => {
    let component: ChangelogDialogComponent
    let fixture: ComponentFixture<ChangelogDialogComponent>
    let mockFacade: {
        currentVersion: string
        previousVersion: WritableSignal<string | null>
        shouldShowChangelog: WritableSignal<boolean>
        parseChangesBetweenVersions: jest.Mock
        acknowledgeChangelog: jest.Mock
    }

    beforeEach(async () => {
        mockFacade = {
            currentVersion: "1.77.0",
            previousVersion: signal<string | null>("1.76.0"),
            shouldShowChangelog: signal(false),
            parseChangesBetweenVersions: jest.fn().mockReturnValue([{ title: "Added 🚀", changes: "<li>New feature</li>" }]),
            acknowledgeChangelog: jest.fn()
        }

        await TestBed.configureTestingModule({
            imports: [ChangelogDialogComponent],
            providers: [{ provide: ChangelogFacade, useValue: mockFacade }]
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
        expect(mockFacade.parseChangesBetweenVersions).toHaveBeenCalledWith("1.76.0", "1.77.0")
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
        expect(mockFacade.acknowledgeChangelog).toHaveBeenCalled()
        expect(mockClose).toHaveBeenCalled()
    })

    it("should return empty changes when no previous version", () => {
        // Arrange
        mockFacade.previousVersion.set(null)
        fixture.detectChanges()

        // Act
        const changes = component.changes()

        // Assert
        expect(changes).toEqual([])
    })
})
