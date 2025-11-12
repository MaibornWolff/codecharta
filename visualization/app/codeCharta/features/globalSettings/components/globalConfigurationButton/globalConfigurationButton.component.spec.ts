import { ComponentFixture, TestBed } from "@angular/core/testing"
import { screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { provideMockStore } from "@ngrx/store/testing"
import { State } from "@ngrx/store"
import { GlobalConfigurationButtonComponent } from "./globalConfigurationButton.component"
import { GlobalConfigurationDialogComponent } from "../globalConfigurationDialog/globalConfigurationDialog.component"
import { defaultAppSettings } from "../../../../state/store/appSettings/appSettings.reducer"

describe("GlobalConfigurationButtonComponent", () => {
    let fixture: ComponentFixture<GlobalConfigurationButtonComponent>
    let component: GlobalConfigurationButtonComponent
    let mockDialog: jest.Mocked<GlobalConfigurationDialogComponent>
    let mockState: jest.Mocked<State<any>>

    beforeEach(() => {
        mockDialog = {
            open: jest.fn()
        } as any

        mockState = {
            getValue: jest.fn().mockReturnValue({ appSettings: defaultAppSettings })
        } as any

        TestBed.configureTestingModule({
            imports: [GlobalConfigurationButtonComponent],
            providers: [
                provideMockStore({
                    initialState: { appSettings: defaultAppSettings }
                }),
                { provide: State, useValue: mockState }
            ]
        })

        fixture = TestBed.createComponent(GlobalConfigurationButtonComponent)
        component = fixture.componentInstance

        // Mock the dialog viewChild
        Object.defineProperty(component, "dialog", {
            value: () => mockDialog,
            writable: false
        })

        fixture.detectChanges()
    })

    describe("rendering", () => {
        it("should render action icon button", () => {
            // Arrange & Act
            const buttons = screen.getAllByRole("button")
            const configButton = buttons[0] // The first button is the config button

            // Assert
            expect(configButton).toBeTruthy()
        })

        it("should have settings icon", () => {
            // Arrange & Act
            const icon = document.querySelector("i.fa-cog, i.fa-gear")

            // Assert
            expect(icon).toBeTruthy()
        })
    })

    describe("showGlobalConfiguration", () => {
        it("should call dialog open method when button is clicked", async () => {
            // Arrange
            const buttons = screen.getAllByRole("button")
            const configButton = buttons[0] // The first button is the config button

            // Act
            await userEvent.click(configButton)

            // Assert
            expect(mockDialog.open).toHaveBeenCalled()
        })

        it("should call dialog open method when showGlobalConfiguration is called directly", () => {
            // Arrange & Act
            component.showGlobalConfiguration()

            // Assert
            expect(mockDialog.open).toHaveBeenCalled()
        })

        it("should only call dialog open once per click", async () => {
            // Arrange
            const buttons = screen.getAllByRole("button")
            const configButton = buttons[0] // The first button is the config button

            // Act
            await userEvent.click(configButton)

            // Assert
            expect(mockDialog.open).toHaveBeenCalledTimes(1)
        })
    })

    describe("dialog reference", () => {
        it("should have required dialog viewChild", () => {
            // Arrange & Act
            const dialog = component.dialog()

            // Assert
            expect(dialog).toBeTruthy()
        })
    })

    describe("accessibility", () => {
        it("should have button role for keyboard navigation", () => {
            // Arrange & Act
            const buttons = screen.getAllByRole("button")
            const configButton = buttons[0] // The first button is the config button

            // Assert
            expect(configButton).toBeTruthy()
            expect(configButton.tagName).toBe("BUTTON")
        })

        it("should be keyboard accessible", async () => {
            // Arrange
            const buttons = screen.getAllByRole("button")
            const configButton = buttons[0] // The first button is the config button
            configButton.focus()

            // Act
            await userEvent.keyboard("{Enter}")

            // Assert
            expect(mockDialog.open).toHaveBeenCalled()
        })
    })
})
