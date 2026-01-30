import { ComponentFixture, TestBed } from "@angular/core/testing"
import { ChangelogButtonComponent } from "./changelogButton.component"
import { ChangelogFacade } from "../../facade"
import { signal } from "@angular/core"

describe("ChangelogButtonComponent", () => {
    let component: ChangelogButtonComponent
    let fixture: ComponentFixture<ChangelogButtonComponent>

    beforeEach(async () => {
        const mockFacade = {
            currentVersion: "1.77.0",
            previousVersion: signal<string | null>(null),
            shouldShowChangelog: signal(false),
            parseChangesBetweenVersions: jest.fn().mockReturnValue([]),
            acknowledgeChangelog: jest.fn()
        }

        await TestBed.configureTestingModule({
            imports: [ChangelogButtonComponent],
            providers: [{ provide: ChangelogFacade, useValue: mockFacade }]
        }).compileComponents()

        fixture = TestBed.createComponent(ChangelogButtonComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it("should create", () => {
        // Assert
        expect(component).toBeTruthy()
    })

    it("should have dialog reference", () => {
        // Arrange & Act
        const dialog = component.dialog()

        // Assert
        expect(dialog).toBeTruthy()
    })

    it("should open dialog when showChangelog is called", () => {
        // Arrange
        const mockShowModal = jest.fn()
        component.dialog().dialogElement().nativeElement.showModal = mockShowModal

        // Act
        component.showChangelog()

        // Assert
        expect(mockShowModal).toHaveBeenCalled()
    })
})
