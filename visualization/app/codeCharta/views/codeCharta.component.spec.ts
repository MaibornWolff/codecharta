import { TestBed } from "@angular/core/testing"
import { LoadFilesUseCase } from "../load/load.facade"
import { CodeChartaComponent } from "./codeCharta.component"

describe("codeChartaComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CodeChartaComponent],
            providers: [{ provide: LoadFilesUseCase, useValue: { loadOnBoot: jest.fn() } }]
        })
    })

    it("should load the files on initialization", () => {
        // Arrange
        const mockedLoadFilesUseCase = {
            loadOnBoot: jest.fn().mockResolvedValue(undefined)
        } as unknown as LoadFilesUseCase
        const codeChartaComponent = new CodeChartaComponent(mockedLoadFilesUseCase)

        // Act
        codeChartaComponent.ngOnInit()

        // Assert
        expect(mockedLoadFilesUseCase.loadOnBoot).toHaveBeenCalled()
    })

    it("should set isInitialized on angulars init event after the files are loaded", async () => {
        // Arrange
        const mockedLoadFilesUseCase = {
            loadOnBoot: jest.fn().mockResolvedValue(undefined)
        } as unknown as LoadFilesUseCase
        const codeChartaComponent = new CodeChartaComponent(mockedLoadFilesUseCase)

        // Act
        expect(codeChartaComponent.isInitialized()).toBe(false)
        codeChartaComponent.ngOnInit()
        await Promise.resolve()
        await Promise.resolve()

        // Assert
        expect(codeChartaComponent.isInitialized()).toBe(true)
    })

    it("should set isInitialized even when the load rejects", async () => {
        // Arrange
        const mockedLoadFilesUseCase = {
            loadOnBoot: jest.fn().mockRejectedValue(new Error("boom"))
        } as unknown as LoadFilesUseCase
        const codeChartaComponent = new CodeChartaComponent(mockedLoadFilesUseCase)

        // Act
        codeChartaComponent.ngOnInit()
        await Promise.resolve()
        await Promise.resolve()
        await Promise.resolve()

        // Assert
        expect(codeChartaComponent.isInitialized()).toBe(true)
    })
})
