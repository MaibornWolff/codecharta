import { ComponentFixture, TestBed } from "@angular/core/testing"
import { screen, render } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { SettingToggleComponent } from "./settingToggle.component"

describe("SettingToggleComponent", () => {
    let fixture: ComponentFixture<SettingToggleComponent>

    async function renderComponent(checked: boolean, label: string) {
        return render(SettingToggleComponent, {
            componentInputs: { checked, label }
        })
    }

    describe("rendering", () => {
        it("should render label text", async () => {
            // Arrange & Act
            await renderComponent(false, "Test Setting")

            // Assert
            expect(screen.getByText("Test Setting")).toBeTruthy()
        })

        it("should render checkbox input", async () => {
            // Arrange & Act
            await renderComponent(false, "Test Setting")

            // Assert
            const checkbox = screen.getByRole("checkbox")
            expect(checkbox).toBeTruthy()
        })

        it("should have DaisyUI toggle classes", async () => {
            // Arrange & Act
            await renderComponent(false, "Test Setting")

            // Assert
            const checkbox = screen.getByRole("checkbox")
            expect(checkbox.classList.contains("toggle")).toBe(true)
            expect(checkbox.classList.contains("toggle-primary")).toBe(true)
        })
    })

    describe("checked state", () => {
        it("should display checked state when checked is true", async () => {
            // Arrange & Act
            await renderComponent(true, "Test Setting")

            // Assert
            const checkbox = screen.getByRole("checkbox") as HTMLInputElement
            expect(checkbox.checked).toBe(true)
        })

        it("should display unchecked state when checked is false", async () => {
            // Arrange & Act
            await renderComponent(false, "Test Setting")

            // Assert
            const checkbox = screen.getByRole("checkbox") as HTMLInputElement
            expect(checkbox.checked).toBe(false)
        })
    })

    describe("checkedChange event", () => {
        it("should emit true when checkbox is checked", async () => {
            // Arrange
            const result = await renderComponent(false, "Test Setting")
            const emittedValues: boolean[] = []
            result.fixture.componentInstance.checkedChange.subscribe((value: boolean) => {
                emittedValues.push(value)
            })

            // Act
            const checkbox = screen.getByRole("checkbox")
            await userEvent.click(checkbox)

            // Assert
            expect(emittedValues).toEqual([true])
        })

        it("should emit false when checkbox is unchecked", async () => {
            // Arrange
            const result = await renderComponent(true, "Test Setting")
            const emittedValues: boolean[] = []
            result.fixture.componentInstance.checkedChange.subscribe((value: boolean) => {
                emittedValues.push(value)
            })

            // Act
            const checkbox = screen.getByRole("checkbox")
            await userEvent.click(checkbox)

            // Assert
            expect(emittedValues).toEqual([false])
        })

        it("should emit multiple times when toggled multiple times", async () => {
            // Arrange
            const result = await renderComponent(false, "Test Setting")
            const emittedValues: boolean[] = []
            result.fixture.componentInstance.checkedChange.subscribe((value: boolean) => {
                emittedValues.push(value)
            })

            // Act
            const checkbox = screen.getByRole("checkbox")
            await userEvent.click(checkbox) // true
            await userEvent.click(checkbox) // false
            await userEvent.click(checkbox) // true

            // Assert
            expect(emittedValues).toEqual([true, false, true])
        })
    })

    describe("accessibility", () => {
        it("should have accessible label", async () => {
            // Arrange & Act
            await renderComponent(false, "Enable Dark Mode")

            // Assert
            const checkbox = screen.getByRole("checkbox")
            const label = checkbox.closest("label")
            expect(label).toBeTruthy()
            expect(label?.textContent).toContain("Enable Dark Mode")
        })

        it("should be keyboard accessible", async () => {
            // Arrange
            const result = await renderComponent(false, "Test Setting")
            const emittedValues: boolean[] = []
            result.fixture.componentInstance.checkedChange.subscribe((value: boolean) => {
                emittedValues.push(value)
            })

            // Act
            const checkbox = screen.getByRole("checkbox")
            checkbox.focus()
            await userEvent.keyboard(" ") // Space key to toggle

            // Assert
            expect(emittedValues).toEqual([true])
        })
    })
})
