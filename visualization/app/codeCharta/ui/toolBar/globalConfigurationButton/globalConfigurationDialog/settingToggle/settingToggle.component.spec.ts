import { ComponentFixture, TestBed } from "@angular/core/testing"
import { screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { SettingToggleComponent } from "./settingToggle.component"

describe("SettingToggleComponent", () => {
    let fixture: ComponentFixture<SettingToggleComponent>

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SettingToggleComponent]
        })
    })

    it("should render toggle with label", () => {
        // Arrange
        fixture = TestBed.createComponent(SettingToggleComponent)
        fixture.componentRef.setInput("checked", false)
        fixture.componentRef.setInput("label", "Test Setting")

        // Act
        fixture.detectChanges()

        // Assert
        const checkbox = screen.getByRole("checkbox") as HTMLInputElement
        expect(checkbox.checked).toBe(false)
        expect(screen.getByText("Test Setting")).toBeTruthy()
    })

    it("should render checked toggle when checked is true", () => {
        // Arrange
        fixture = TestBed.createComponent(SettingToggleComponent)
        fixture.componentRef.setInput("checked", true)
        fixture.componentRef.setInput("label", "Test Setting")

        // Act
        fixture.detectChanges()

        // Assert
        const checkbox = screen.getByRole("checkbox") as HTMLInputElement
        expect(checkbox.checked).toBe(true)
    })

    it("should emit checkedChange event when toggle is clicked", async () => {
        // Arrange
        fixture = TestBed.createComponent(SettingToggleComponent)
        fixture.componentRef.setInput("checked", false)
        fixture.componentRef.setInput("label", "Test Setting")
        fixture.detectChanges()

        let emittedValue: boolean | undefined
        fixture.componentInstance.checkedChange.subscribe((value: boolean) => {
            emittedValue = value
        })

        // Act
        const checkbox = screen.getByRole("checkbox")
        await userEvent.click(checkbox)

        // Assert
        expect(emittedValue).toBe(true)
    })
})
