import { TestBed } from "@angular/core/testing"
import { LoadInitialFileService } from "./services/loadInitialFile/loadInitialFile.service"
import { CodeChartaModule } from "./codeCharta.module"
import { CodeChartaComponent } from "./codeCharta.component"
import { setIsLoadingFile } from "./state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import { Store } from "@ngrx/store"

describe("codeChartaComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CodeChartaModule],
            providers: [{ provide: LoadInitialFileService, useValue: { loadFilesOrSampleFiles: jest.fn() } }]
        })
    })

    it("should set is loading and call loadFilesOrSampleFiles on initialization", async () => {
        const mockedStore = { dispatch: jest.fn() } as unknown as Store
        const mockedLoadInitialFileService = { loadFilesOrSampleFiles: jest.fn() } as unknown as LoadInitialFileService

        const codeChartaComponent = new CodeChartaComponent(mockedStore, mockedLoadInitialFileService)
        await codeChartaComponent.ngOnInit()

        expect(mockedStore.dispatch).toHaveBeenCalledWith(setIsLoadingFile({ value: true }))
        expect(mockedLoadInitialFileService.loadFilesOrSampleFiles).toHaveBeenCalled()
    })

    it("should set isInitialized on angulars init event after fileService is loaded", async () => {
        const mockedStore = { dispatch: jest.fn() } as unknown as Store
        const mockedLoadInitialFileService = { loadFilesOrSampleFiles: jest.fn() } as unknown as LoadInitialFileService

        const codeChartaComponent = new CodeChartaComponent(mockedStore, mockedLoadInitialFileService)
        expect(codeChartaComponent.isInitialized).toBe(false)

        await codeChartaComponent.ngOnInit()
        expect(codeChartaComponent.isInitialized).toBe(true)
    })
})
