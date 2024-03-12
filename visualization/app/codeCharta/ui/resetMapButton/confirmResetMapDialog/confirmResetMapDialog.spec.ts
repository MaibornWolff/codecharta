import { HttpClient } from "@angular/common/http"
import { TestBed } from "@angular/core/testing"
import { MatDialog, MatDialogRef } from "@angular/material/dialog"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import "fake-indexeddb/auto"
import { getNameDataPair } from "../../../services/loadFile/fileParser"
import { LoadFileService } from "../../../services/loadFile/loadFile.service"
import { LoadInitialFileService, sampleFile1, sampleFile2 } from "../../../services/loadInitialFile/loadInitialFile.service"
import { UrlExtractor } from "../../../services/loadInitialFile/urlExtractor"
import { setState } from "../../../state/store/state.actions"
import { defaultState } from "../../../state/store/state.manager"
import { TEST_DELTA_MAP_A } from "../../../util/dataMocks"
import * as indexedDBWriter from "../../../util/indexedDB/indexedDBWriter"
import { ResetMapButtonModule } from "../resetMapButton.module"
import { ConfirmResetMapDialogComponent } from "./confirmResetMapDialog.component"

jest.mock("../../../util/indexedDB/indexedDBWriter")
jest.mock("../../../services/loadInitialFile/urlExtractor")

describe("ConfirmResetMapDialogComponent", () => {
	const mockedDialog = { open: jest.fn() }
	const mockedDialogReference = { close: jest.fn() }

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ResetMapButtonModule],
			providers: [
				{ provide: MatDialogRef, useValue: mockedDialogReference },
				{ provide: MatDialog, useValue: mockedDialog },
				{ provide: State, useValue: { getValue: () => defaultState } },
				{
					provide: LoadInitialFileService,
					useValue: { setRenderStateFromUrl: jest.fn(), checkFileQueryParameterPresent: jest.fn(() => false) }
				},
				{ provide: LoadFileService, useValue: { loadFiles: jest.fn() } },
				{ provide: HttpClient, useValue: {} },
				provideMockStore()
			]
		})
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it("Should reset state to default when confirm is selected and no file query parameter is specified", async () => {
		await render(ConfirmResetMapDialogComponent)

		const store = TestBed.inject(MockStore)
		const loadFileService = TestBed.inject(LoadFileService)
		const loadInitialFileService = TestBed.inject(LoadInitialFileService)

		const dispatchSpy = jest.spyOn(store, "dispatch")
		const spyDeleteCcState = jest.spyOn(indexedDBWriter, "deleteCcState")

		await userEvent.click(screen.getByText("Yes"))

		expect(spyDeleteCcState).toHaveBeenCalled()
		expect(dispatchSpy).toHaveBeenCalledWith(setState({ value: defaultState }))
		expect(loadFileService.loadFiles).toHaveBeenCalledWith([sampleFile1, sampleFile2])
		expect(loadInitialFileService.setRenderStateFromUrl).not.toHaveBeenCalled()
	})

	it("Should reset state to maps in file query parameter when confirm is selected and file query parameter is specified", async () => {
		await render(ConfirmResetMapDialogComponent, { excludeComponentDeclaration: true })

		const store = TestBed.inject(MockStore)
		const loadFileService = TestBed.inject(LoadFileService)
		const loadInitialFileService = TestBed.inject(LoadInitialFileService)
		const mockedNameDataPairs = [getNameDataPair(TEST_DELTA_MAP_A)]

		const dispatchSpy = jest.spyOn(store, "dispatch")
		const spyDeleteCcState = jest.spyOn(indexedDBWriter, "deleteCcState")
		jest.spyOn(loadInitialFileService, "checkFileQueryParameterPresent").mockImplementation(() => true)
		jest.mocked(UrlExtractor.prototype.getFileDataFromQueryParam).mockImplementation(
			async () => new Promise(resolve => resolve(mockedNameDataPairs))
		)

		await userEvent.click(screen.getByText("Yes"))

		expect(spyDeleteCcState).toHaveBeenCalled()
		expect(dispatchSpy).toHaveBeenCalledWith(setState({ value: defaultState }))
		expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
		expect(loadInitialFileService.setRenderStateFromUrl).toHaveBeenCalled()
	})

	it("Should close dialog when abort is selected", async () => {
		await render(ConfirmResetMapDialogComponent, { excludeComponentDeclaration: true })

		const store = TestBed.inject(MockStore)
		const dispatchSpy = jest.spyOn(store, "dispatch")
		await userEvent.click(screen.getByText("No"))

		expect(dispatchSpy).not.toHaveBeenCalled()
	})
})
