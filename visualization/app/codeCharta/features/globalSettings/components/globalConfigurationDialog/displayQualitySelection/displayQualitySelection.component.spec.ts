import { ComponentFixture, TestBed } from "@angular/core/testing"
import { screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { of } from "rxjs"
import { DisplayQualitySelectionComponent } from "./displayQualitySelection.component"
import { DisplayQualityService } from "../../../services/displayQuality.service"
import { SharpnessMode } from "../../../../../codeCharta.model"

describe("DisplayQualitySelectionComponent", () => {
    let fixture: ComponentFixture<DisplayQualitySelectionComponent>
    let component: DisplayQualitySelectionComponent
    let mockDisplayQualityService: jest.Mocked<DisplayQualityService>

    beforeEach(() => {
        mockDisplayQualityService = {
            sharpnessMode$: jest.fn().mockReturnValue(of(SharpnessMode.Standard)),
            setSharpnessMode: jest.fn()
        } as any

        TestBed.configureTestingModule({
            imports: [DisplayQualitySelectionComponent],
            providers: [{ provide: DisplayQualityService, useValue: mockDisplayQualityService }]
        })

        fixture = TestBed.createComponent(DisplayQualitySelectionComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    describe("initialization", () => {
        it("should create component", () => {
            // Assert
            expect(component).toBeTruthy()
        })

        it("should initialize sharpnessMode from service", () => {
            // Arrange & Act
            const sharpnessMode = component.sharpnessMode()

            // Assert
            expect(sharpnessMode).toBe(SharpnessMode.Standard)
        })

        it("should have all sharpness modes available", () => {
            // Arrange & Act & Assert
            expect(component.sharpnessModes).toEqual(Object.values(SharpnessMode))
            expect(component.sharpnessModes.length).toBe(4) // Standard, PixelRatioNoAA, PixelRatioFXAA, PixelRatioAA
        })
    })

    describe("rendering", () => {
        it("should render sharpness mode dropdown", () => {
            // Arrange & Act
            const select = screen.getByRole("combobox")

            // Assert
            expect(select).toBeTruthy()
        })

        it("should display current sharpness mode value", () => {
            // Arrange & Act
            const select = screen.getByRole("combobox") as HTMLSelectElement

            // Assert
            expect(select.value).toBe(SharpnessMode.Standard)
        })

        it("should render all sharpness mode options", () => {
            // Arrange & Act
            const options = screen.getAllByRole("option")

            // Assert
            expect(options.length).toBe(4)
        })
    })

    describe("sharpness mode selection", () => {
        it("should call setSharpnessMode when Standard is selected", async () => {
            // Arrange
            const select = screen.getByRole("combobox") as HTMLSelectElement

            // Act
            await userEvent.selectOptions(select, SharpnessMode.Standard)

            // Assert
            expect(mockDisplayQualityService.setSharpnessMode).toHaveBeenCalledWith(SharpnessMode.Standard)
        })

        it("should call setSharpnessMode when PixelRatioNoAA is selected", async () => {
            // Arrange
            const select = screen.getByRole("combobox") as HTMLSelectElement

            // Act
            await userEvent.selectOptions(select, SharpnessMode.PixelRatioNoAA)

            // Assert
            expect(mockDisplayQualityService.setSharpnessMode).toHaveBeenCalledWith(SharpnessMode.PixelRatioNoAA)
        })

        it("should call setSharpnessMode when PixelRatioFXAA is selected", async () => {
            // Arrange
            const select = screen.getByRole("combobox") as HTMLSelectElement

            // Act
            await userEvent.selectOptions(select, SharpnessMode.PixelRatioFXAA)

            // Assert
            expect(mockDisplayQualityService.setSharpnessMode).toHaveBeenCalledWith(SharpnessMode.PixelRatioFXAA)
        })

        it("should call setSharpnessMode when PixelRatioAA is selected", async () => {
            // Arrange
            const select = screen.getByRole("combobox") as HTMLSelectElement

            // Act
            await userEvent.selectOptions(select, SharpnessMode.PixelRatioAA)

            // Assert
            expect(mockDisplayQualityService.setSharpnessMode).toHaveBeenCalledWith(SharpnessMode.PixelRatioAA)
        })
    })

    describe("signal reactivity", () => {
        it("should update when sharpness mode changes in service", () => {
            // Arrange
            mockDisplayQualityService.sharpnessMode$ = jest.fn().mockReturnValue(of(SharpnessMode.PixelRatioAA))

            // Act
            fixture = TestBed.createComponent(DisplayQualitySelectionComponent)
            component = fixture.componentInstance
            fixture.detectChanges()

            // Assert
            expect(component.sharpnessMode()).toBe(SharpnessMode.PixelRatioAA)
        })
    })

    describe("accessibility", () => {
        it("should have combobox role for dropdown", () => {
            // Arrange & Act
            const select = screen.getByRole("combobox")

            // Assert
            expect(select.tagName).toBe("SELECT")
        })

        it("should be keyboard accessible", async () => {
            // Arrange
            const select = screen.getByRole("combobox") as HTMLSelectElement

            // Act - Focus and use keyboard to select
            select.focus()
            await userEvent.selectOptions(select, SharpnessMode.PixelRatioFXAA)

            // Assert - Verify service was called with selected value
            expect(mockDisplayQualityService.setSharpnessMode).toHaveBeenCalledWith(SharpnessMode.PixelRatioFXAA)
        })
    })
})
