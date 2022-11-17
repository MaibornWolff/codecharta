import { TestBed } from "@angular/core/testing"
import { LoadInitialFileService } from "./services/loadInitialFile/loadInitialFile.service"
import { CodeChartaModule } from "./codeCharta.module"
import { CodeChartaComponent } from "./codeCharta.component"
import { Store } from "./state/angular-redux/store"
import { setIsLoadingFile } from "./state/store/appSettings/isLoadingFile/isLoadingFile.actions"

describe("codeChartaComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [CodeChartaModule],
			providers: [{ provide: LoadInitialFileService, useValue: { loadFileOrSample: jest.fn() } }]
		})
	})

	it("should set is loading and call loadFileOrSample on initialization", async () => {
		const mockedStore = { dispatch: jest.fn() } as unknown as Store
		const mockedLoadInitialFileService = { loadFileOrSample: jest.fn() } as unknown as LoadInitialFileService

		const codeChartaComponent = new CodeChartaComponent(mockedStore, mockedLoadInitialFileService)
		await codeChartaComponent.ngOnInit()

		expect(mockedStore.dispatch).toHaveBeenCalledWith(setIsLoadingFile(true))
		expect(mockedLoadInitialFileService.loadFileOrSample).toHaveBeenCalled()
	})

	it("should set isInitilized on windows' load event, so the app doesn't flicker on initial page load", () => {
		const mockedStore = { dispatch: jest.fn() } as unknown as Store
		const mockedLoadInitialFileService = { loadFileOrSample: jest.fn() } as unknown as LoadInitialFileService

		const codeChartaComponent = new CodeChartaComponent(mockedStore, mockedLoadInitialFileService)
		expect(codeChartaComponent.isInitialized).toBe(false)

		window.dispatchEvent(new Event("load"))
		expect(codeChartaComponent.isInitialized).toBe(true)
	})
})
