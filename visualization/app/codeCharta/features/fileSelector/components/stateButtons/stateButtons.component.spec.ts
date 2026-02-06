import { render, screen } from "@testing-library/angular"
import { StateButtonsComponent } from "./stateButtons.component"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { TestBed } from "@angular/core/testing"
import { FileSelectionModeService } from "../../services/fileSelectionMode.service"
import { isDeltaStateSelector } from "../../../../state/selectors/isDeltaState.selector"

describe("StateButtonsComponent", () => {
    let mockFileSelectionModeService: Partial<FileSelectionModeService>
    let store: MockStore

    beforeEach(() => {
        mockFileSelectionModeService = {
            toggle: jest.fn()
        }
    })

    afterEach(() => {
        TestBed.resetTestingModule()
    })

    async function renderComponent(isDeltaState: boolean) {
        const result = await render(StateButtonsComponent, {
            providers: [
                provideMockStore({
                    selectors: [{ selector: isDeltaStateSelector, value: isDeltaState }]
                }),
                { provide: FileSelectionModeService, useValue: mockFileSelectionModeService }
            ]
        })
        store = TestBed.inject(MockStore)
        return result
    }

    it("should render Standard and Delta buttons", async () => {
        // Arrange & Act
        await renderComponent(false)

        // Assert
        expect(screen.getByText("Standard")).toBeTruthy()
        expect(screen.getByText("Delta")).toBeTruthy()
    })

    it("should highlight Standard button when in standard mode", async () => {
        // Arrange & Act
        const { fixture } = await renderComponent(false)
        const standardButton = fixture.nativeElement.querySelector("button:first-child")

        // Assert
        expect(standardButton.classList.contains("btn-primary")).toBe(true)
    })

    it("should highlight Delta button when in delta mode", async () => {
        // Arrange & Act
        const { fixture } = await renderComponent(true)
        const deltaButton = fixture.nativeElement.querySelector("button:last-child")

        // Assert
        expect(deltaButton.classList.contains("btn-primary")).toBe(true)
    })

    it("should call toggle when clicking enabled button", async () => {
        // Arrange
        const { fixture } = await renderComponent(false)
        const deltaButton = fixture.nativeElement.querySelector("button:last-child")

        // Act
        deltaButton.click()

        // Assert
        expect(mockFileSelectionModeService.toggle).toHaveBeenCalled()
    })
})
