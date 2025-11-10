import { ComponentFixture, TestBed } from "@angular/core/testing"
import { screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { of } from "rxjs"
import { MapLayoutSelectionComponent } from "./mapLayoutSelection.component"
import { MapLayoutService } from "../../../services/mapLayout.service"
import { LayoutAlgorithm } from "../../../../../codeCharta.model"

describe("MapLayoutSelectionComponent", () => {
    let fixture: ComponentFixture<MapLayoutSelectionComponent>
    let component: MapLayoutSelectionComponent
    let mockMapLayoutService: jest.Mocked<MapLayoutService>

    beforeEach(() => {
        mockMapLayoutService = {
            layoutAlgorithm$: jest.fn().mockReturnValue(of(LayoutAlgorithm.SquarifiedTreeMap)),
            maxTreeMapFiles$: jest.fn().mockReturnValue(of(100)),
            setLayoutAlgorithm: jest.fn(),
            setMaxTreeMapFiles: jest.fn()
        } as any

        TestBed.configureTestingModule({
            imports: [MapLayoutSelectionComponent],
            providers: [{ provide: MapLayoutService, useValue: mockMapLayoutService }]
        })

        fixture = TestBed.createComponent(MapLayoutSelectionComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    describe("initialization", () => {
        it("should create component", () => {
            // Assert
            expect(component).toBeTruthy()
        })

        it("should initialize layout algorithm from service", () => {
            // Arrange & Act
            const layoutAlgorithm = component.layoutAlgorithm()

            // Assert
            expect(layoutAlgorithm).toBe(LayoutAlgorithm.SquarifiedTreeMap)
        })

        it("should initialize maxTreeMapFiles from service", () => {
            // Arrange & Act
            const maxTreeMapFiles = component.maxTreeMapFiles()

            // Assert
            expect(maxTreeMapFiles).toBe(100)
        })

        it("should have all layout algorithms available", () => {
            // Arrange & Act & Assert
            expect(component.layoutAlgorithms).toEqual(Object.values(LayoutAlgorithm))
            expect(component.layoutAlgorithms.length).toBeGreaterThan(0)
        })
    })

    describe("layout algorithm selection", () => {
        it("should render layout algorithm dropdown", () => {
            // Arrange & Act
            const select = screen.getByRole("combobox")

            // Assert
            expect(select).toBeTruthy()
        })

        it("should call setLayoutAlgorithm when selection changes", async () => {
            // Arrange
            const select = screen.getByRole("combobox") as HTMLSelectElement

            // Act
            await userEvent.selectOptions(select, LayoutAlgorithm.StreetMap)

            // Assert
            expect(mockMapLayoutService.setLayoutAlgorithm).toHaveBeenCalledWith(LayoutAlgorithm.StreetMap)
        })

        it("should display current layout algorithm value", () => {
            // Arrange & Act
            const select = screen.getByRole("combobox") as HTMLSelectElement

            // Assert
            expect(select.value).toBe(LayoutAlgorithm.SquarifiedTreeMap)
        })
    })

    describe("TreeMapStreet slider visibility", () => {
        it("should not show slider when layout is not TreeMapStreet", () => {
            // Arrange & Act
            const showSlider = component.showTreeMapSlider()

            // Assert
            expect(showSlider).toBe(false)
        })

        it("should show slider when layout is TreeMapStreet", () => {
            // Arrange
            mockMapLayoutService.layoutAlgorithm$ = jest.fn().mockReturnValue(of(LayoutAlgorithm.TreeMapStreet))
            fixture = TestBed.createComponent(MapLayoutSelectionComponent)
            component = fixture.componentInstance
            fixture.detectChanges()

            // Act
            const showSlider = component.showTreeMapSlider()

            // Assert
            expect(showSlider).toBe(true)
        })
    })

    describe("maxTreeMapFiles range input", () => {
        beforeEach(() => {
            mockMapLayoutService.layoutAlgorithm$ = jest.fn().mockReturnValue(of(LayoutAlgorithm.TreeMapStreet))
            fixture = TestBed.createComponent(MapLayoutSelectionComponent)
            component = fixture.componentInstance
            fixture.detectChanges()
        })

        it("should call setMaxTreeMapFiles with debounce when range input changes", async () => {
            // Arrange
            const rangeInput = screen.getByRole("slider") as HTMLInputElement

            // Act
            rangeInput.value = "250"
            rangeInput.dispatchEvent(new Event("input", { bubbles: true }))

            // Wait for debounce (400ms)
            await new Promise(resolve => setTimeout(resolve, 450))

            // Assert
            expect(mockMapLayoutService.setMaxTreeMapFiles).toHaveBeenCalledWith(250)
        })

        it("should display current maxTreeMapFiles value in range input", () => {
            // Arrange & Act
            const rangeInput = screen.getByRole("slider") as HTMLInputElement

            // Assert
            expect(rangeInput.value).toBe("100")
        })
    })

    describe("maxTreeMapFiles number input", () => {
        beforeEach(() => {
            mockMapLayoutService.layoutAlgorithm$ = jest.fn().mockReturnValue(of(LayoutAlgorithm.TreeMapStreet))
            fixture = TestBed.createComponent(MapLayoutSelectionComponent)
            component = fixture.componentInstance
            fixture.detectChanges()
        })

        it("should call setMaxTreeMapFiles with valid value", async () => {
            // Arrange
            const numberInput = screen.getByRole("spinbutton") as HTMLInputElement

            // Act
            await userEvent.clear(numberInput)
            await userEvent.type(numberInput, "500")

            // Wait for debounce (400ms)
            await new Promise(resolve => setTimeout(resolve, 450))

            // Assert
            expect(mockMapLayoutService.setMaxTreeMapFiles).toHaveBeenCalledWith(500)
        })

        it("should not call setMaxTreeMapFiles with value below minimum (1)", async () => {
            // Arrange
            const numberInput = screen.getByRole("spinbutton") as HTMLInputElement
            mockMapLayoutService.setMaxTreeMapFiles.mockClear()

            // Act - Set value directly to avoid triggering debounce with valid intermediate values
            numberInput.value = "0"
            numberInput.dispatchEvent(new Event("input", { bubbles: true }))

            // Wait for debounce
            await new Promise(resolve => setTimeout(resolve, 450))

            // Assert
            expect(mockMapLayoutService.setMaxTreeMapFiles).not.toHaveBeenCalled()
        })

        it("should not call setMaxTreeMapFiles with value above maximum (1000)", async () => {
            // Arrange
            const numberInput = screen.getByRole("spinbutton") as HTMLInputElement
            mockMapLayoutService.setMaxTreeMapFiles.mockClear()

            // Act - Set value directly to avoid triggering debounce with valid intermediate values
            numberInput.value = "1001"
            numberInput.dispatchEvent(new Event("input", { bubbles: true }))

            // Wait for debounce
            await new Promise(resolve => setTimeout(resolve, 450))

            // Assert
            expect(mockMapLayoutService.setMaxTreeMapFiles).not.toHaveBeenCalled()
        })

        it("should accept minimum value of 1", async () => {
            // Arrange
            const numberInput = screen.getByRole("spinbutton") as HTMLInputElement

            // Act
            await userEvent.clear(numberInput)
            await userEvent.type(numberInput, "1")

            // Wait for debounce
            await new Promise(resolve => setTimeout(resolve, 450))

            // Assert
            expect(mockMapLayoutService.setMaxTreeMapFiles).toHaveBeenCalledWith(1)
        })

        it("should accept maximum value of 1000", async () => {
            // Arrange
            const numberInput = screen.getByRole("spinbutton") as HTMLInputElement

            // Act
            await userEvent.clear(numberInput)
            await userEvent.type(numberInput, "1000")

            // Wait for debounce
            await new Promise(resolve => setTimeout(resolve, 450))

            // Assert
            expect(mockMapLayoutService.setMaxTreeMapFiles).toHaveBeenCalledWith(1000)
        })
    })

    describe("debounce behavior", () => {
        beforeEach(() => {
            mockMapLayoutService.layoutAlgorithm$ = jest.fn().mockReturnValue(of(LayoutAlgorithm.TreeMapStreet))
            fixture = TestBed.createComponent(MapLayoutSelectionComponent)
            component = fixture.componentInstance
            fixture.detectChanges()
        })

        it("should debounce rapid input changes", async () => {
            // Arrange
            const rangeInput = screen.getByRole("slider") as HTMLInputElement
            mockMapLayoutService.setMaxTreeMapFiles.mockClear()

            // Act - Trigger multiple rapid changes
            rangeInput.value = "200"
            rangeInput.dispatchEvent(new Event("input", { bubbles: true }))

            rangeInput.value = "300"
            rangeInput.dispatchEvent(new Event("input", { bubbles: true }))

            rangeInput.value = "400"
            rangeInput.dispatchEvent(new Event("input", { bubbles: true }))

            // Wait for debounce
            await new Promise(resolve => setTimeout(resolve, 450))

            // Assert - Should only call once with the last value
            expect(mockMapLayoutService.setMaxTreeMapFiles).toHaveBeenCalledTimes(1)
            expect(mockMapLayoutService.setMaxTreeMapFiles).toHaveBeenCalledWith(400)
        })
    })
})
