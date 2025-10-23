import { TestBed } from "@angular/core/testing"
import { LoadInitialFileService } from "./services/loadInitialFile/loadInitialFile.service"
import { CodeChartaComponent } from "./codeCharta.component"
import { setIsLoadingFile } from "./state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import { Store } from "@ngrx/store"

describe("codeChartaComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CodeChartaComponent],
            providers: [{ provide: LoadInitialFileService, useValue: { loadFilesOrSampleFiles: jest.fn() } }]
        })
    })

    it("should set is loading and call loadFilesOrSampleFiles on initialization", () => {
        const mockedStore = { dispatch: jest.fn() } as unknown as Store
        const mockedLoadInitialFileService = { loadFilesOrSampleFiles: jest.fn().mockResolvedValue(undefined) } as unknown as LoadInitialFileService

        const codeChartaComponent = new CodeChartaComponent(mockedStore, mockedLoadInitialFileService)
        codeChartaComponent.ngOnInit()

        expect(mockedStore.dispatch).toHaveBeenCalledWith(setIsLoadingFile({ value: true }))
        expect(mockedLoadInitialFileService.loadFilesOrSampleFiles).toHaveBeenCalled()
    })

    it("should set isInitialized on angulars init event after fileService is loaded", async () => {
        // Arrange
        const mockedStore = { dispatch: jest.fn() } as unknown as Store
        const mockedLoadInitialFileService = { loadFilesOrSampleFiles: jest.fn().mockResolvedValue(undefined) } as unknown as LoadInitialFileService

        const codeChartaComponent = new CodeChartaComponent(mockedStore, mockedLoadInitialFileService)

        // Act
        expect(codeChartaComponent.isInitialized()).toBe(false)
        codeChartaComponent.ngOnInit()

        // Wait for promise to resolve
        await Promise.resolve()

        // Assert
        expect(codeChartaComponent.isInitialized()).toBe(true)
    })
})
