import { ComponentFixture, TestBed } from "@angular/core/testing"
import { screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { ResetSettingsButtonComponent } from "./resetSettingsButton.component"
import { ResetSettingsService } from "../../../services/resetSettings.service"

describe("ResetSettingsButtonComponent", () => {
    let fixture: ComponentFixture<ResetSettingsButtonComponent>
    let component: ResetSettingsButtonComponent
    let mockResetSettingsService: jest.Mocked<ResetSettingsService>

    beforeEach(() => {
        mockResetSettingsService = {
            resetSettings: jest.fn()
        } as any

        TestBed.configureTestingModule({
            imports: [ResetSettingsButtonComponent],
            providers: [{ provide: ResetSettingsService, useValue: mockResetSettingsService }]
        })

        fixture = TestBed.createComponent(ResetSettingsButtonComponent)
        component = fixture.componentInstance
        fixture.componentRef.setInput("settingsKeys", ["appSettings.isWhiteBackground"])
        fixture.detectChanges()
    })

    describe("initialization", () => {
        it("should create component", () => {
            // Assert
            expect(component).toBeTruthy()
        })

        it("should accept settingsKeys input", () => {
            // Arrange & Act
            const settingsKeys = component.settingsKeys()

            // Assert
            expect(settingsKeys).toEqual(["appSettings.isWhiteBackground"])
        })

        it("should accept optional tooltip input", () => {
            // Arrange
            fixture.componentRef.setInput("tooltip", "Reset to default")
            fixture.detectChanges()

            // Act
            const tooltip = component.tooltip()

            // Assert
            expect(tooltip).toBe("Reset to default")
        })

        it("should accept optional label input", () => {
            // Arrange
            fixture.componentRef.setInput("label", "Reset")
            fixture.detectChanges()

            // Act
            const label = component.label()

            // Assert
            expect(label).toBe("Reset")
        })
    })

    describe("rendering", () => {
        it("should render reset button", () => {
            // Arrange & Act
            const button = screen.getByRole("button")

            // Assert
            expect(button).toBeTruthy()
        })

        it("should display label when provided", () => {
            // Arrange
            fixture.componentRef.setInput("label", "Reset Settings")
            fixture.detectChanges()

            // Act
            const button = screen.getByRole("button")

            // Assert
            expect(button.textContent).toContain("Reset Settings")
        })

        it("should have reset icon", () => {
            // Arrange & Act
            const icon = document.querySelector("i.fa-undo, i.fa-rotate-left")

            // Assert
            expect(icon).toBeTruthy()
        })

        it("should display tooltip when provided", () => {
            // Arrange
            fixture.componentRef.setInput("tooltip", "Reset to defaults")
            fixture.detectChanges()

            // Act
            const button = screen.getByRole("button")

            // Assert
            expect(button.title || button.getAttribute("title")).toBeTruthy()
        })
    })

    describe("applyDefaultSettings", () => {
        it("should call resetSettings service with provided settings keys", async () => {
            // Arrange
            const button = screen.getByRole("button")

            // Act
            await userEvent.click(button)

            // Assert
            expect(mockResetSettingsService.resetSettings).toHaveBeenCalledWith(["appSettings.isWhiteBackground"])
        })

        it("should emit callback event when button is clicked", async () => {
            // Arrange
            const button = screen.getByRole("button")
            let callbackEmitted = false
            component.callback.subscribe(() => {
                callbackEmitted = true
            })

            // Act
            await userEvent.click(button)

            // Assert
            expect(callbackEmitted).toBe(true)
        })

        it("should reset multiple settings keys", async () => {
            // Arrange
            fixture.componentRef.setInput("settingsKeys", ["appSettings.isWhiteBackground", "appSettings.hideFlatBuildings"])
            fixture.detectChanges()
            const button = screen.getByRole("button")

            // Act
            await userEvent.click(button)

            // Assert
            expect(mockResetSettingsService.resetSettings).toHaveBeenCalledWith([
                "appSettings.isWhiteBackground",
                "appSettings.hideFlatBuildings"
            ])
        })

        it("should call resetSettings before emitting callback", async () => {
            // Arrange
            const button = screen.getByRole("button")
            const callOrder: string[] = []

            mockResetSettingsService.resetSettings.mockImplementation(() => {
                callOrder.push("resetSettings")
            })

            component.callback.subscribe(() => {
                callOrder.push("callback")
            })

            // Act
            await userEvent.click(button)

            // Assert
            expect(callOrder).toEqual(["resetSettings", "callback"])
        })
    })

    describe("direct method call", () => {
        it("should call resetSettings when applyDefaultSettings is called directly", () => {
            // Arrange & Act
            component.applyDefaultSettings()

            // Assert
            expect(mockResetSettingsService.resetSettings).toHaveBeenCalledWith(["appSettings.isWhiteBackground"])
        })

        it("should emit callback when applyDefaultSettings is called directly", () => {
            // Arrange
            let callbackEmitted = false
            component.callback.subscribe(() => {
                callbackEmitted = true
            })

            // Act
            component.applyDefaultSettings()

            // Assert
            expect(callbackEmitted).toBe(true)
        })
    })

    describe("accessibility", () => {
        it("should have button role for keyboard navigation", () => {
            // Arrange & Act
            const button = screen.getByRole("button")

            // Assert
            expect(button.tagName).toBe("BUTTON")
        })

        it("should be keyboard accessible", async () => {
            // Arrange
            const button = screen.getByRole("button")
            button.focus()

            // Act
            await userEvent.keyboard("{Enter}")

            // Assert
            expect(mockResetSettingsService.resetSettings).toHaveBeenCalled()
        })
    })

    describe("edge cases", () => {
        it("should handle empty settings keys array", async () => {
            // Arrange
            fixture.componentRef.setInput("settingsKeys", [])
            fixture.detectChanges()
            const button = screen.getByRole("button")

            // Act
            await userEvent.click(button)

            // Assert
            expect(mockResetSettingsService.resetSettings).toHaveBeenCalledWith([])
        })

        it("should handle button click without callback subscriber", async () => {
            // Arrange
            const button = screen.getByRole("button")

            // Act & Assert - Should not throw error
            await expect(userEvent.click(button)).resolves.not.toThrow()
            expect(mockResetSettingsService.resetSettings).toHaveBeenCalled()
        })
    })
})
