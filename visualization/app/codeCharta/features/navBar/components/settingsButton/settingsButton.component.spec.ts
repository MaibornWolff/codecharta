import { ComponentFixture, TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { defaultAppSettings } from "../../../../state/store/appSettings/appSettings.reducer"
import { GlobalConfigurationDialogComponent } from "../../../globalSettings/components/globalConfigurationDialog/globalConfigurationDialog.component"
import { SettingsButtonComponent } from "./settingsButton.component"

describe("SettingsButtonComponent", () => {
    let fixture: ComponentFixture<SettingsButtonComponent>
    let component: SettingsButtonComponent
    let mockDialog: jest.Mocked<Partial<GlobalConfigurationDialogComponent>>

    beforeEach(() => {
        mockDialog = {
            open: jest.fn()
        }

        TestBed.configureTestingModule({
            imports: [SettingsButtonComponent],
            providers: [
                provideMockStore({ initialState: { appSettings: defaultAppSettings } }),
                { provide: State, useValue: { getValue: () => ({ appSettings: defaultAppSettings }) } }
            ]
        })

        fixture = TestBed.createComponent(SettingsButtonComponent)
        component = fixture.componentInstance

        Object.defineProperty(component, "dialog", {
            value: () => mockDialog,
            writable: false
        })

        fixture.detectChanges()
    })

    it("should render Settings button", () => {
        // Arrange & Act
        const button = screen.getByRole("button", { name: "Settings" })

        // Assert
        expect(button).toBeTruthy()
    })

    it("should call dialog open when button is clicked", async () => {
        // Arrange
        const button = screen.getByRole("button", { name: "Settings" })

        // Act
        await userEvent.click(button)

        // Assert
        expect(mockDialog.open).toHaveBeenCalledTimes(1)
    })
})
