import { HttpClient } from "@angular/common/http"
import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import "fake-indexeddb/auto"
import { getNameDataPair } from "../../../../../fileStore/fileStore.facade"
import { LoadFileService } from "../../../../../fileStore/fileStore.facade"
import { LoadInitialFileService, sampleFile1, sampleFile2 } from "../../../../../fileStore/fileStore.facade"
import { UrlExtractor } from "../../../../../fileStore/fileStore.facade"
import * as resetChosenMetricsEffect from "../../../../../state/effects/resetChosenMetrics/resetChosenMetrics.effect"
import { metricDataSelector } from "../../../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { setState } from "../../../../../state/store/state.actions"
import { defaultState } from "../../../../../state/store/state.manager"
import { METRIC_DATA, TEST_DELTA_MAP_A } from "../../../../../mocks/dataMocks"
import * as indexedDBWriter from "../../../../../util/indexedDB/indexedDBWriter"
import { ConfirmResetMapDialogComponent } from "./confirmResetMapDialog.component"

jest.mock("../../../../../util/indexedDB/indexedDBWriter")
jest.mock("../../../../../fileStore/fileStore.facade")
jest.mock("../../../../../state/effects/resetChosenMetrics/resetChosenMetrics.effect")

describe("ConfirmResetMapDialogComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ConfirmResetMapDialogComponent],
            providers: [
                { provide: State, useValue: { getValue: () => defaultState } },
                {
                    provide: LoadInitialFileService,
                    useValue: { setRenderStateFromUrl: jest.fn(), checkFileQueryParameterPresent: jest.fn(() => false) }
                },
                { provide: LoadFileService, useValue: { loadFiles: jest.fn() } },
                { provide: HttpClient, useValue: {} },
                provideMockStore({
                    selectors: [
                        {
                            selector: metricDataSelector,
                            value: METRIC_DATA
                        }
                    ]
                })
            ]
        })

        // jsdom stubs for native <dialog>
        HTMLDialogElement.prototype.showModal = jest.fn()
        HTMLDialogElement.prototype.close = jest.fn()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    async function renderAndOpen() {
        const renderResult = await render(ConfirmResetMapDialogComponent)
        renderResult.fixture.componentInstance.open()
        renderResult.fixture.detectChanges()
        return renderResult
    }

    it("Should reset state to default when confirm is selected and no file query parameter is specified", async () => {
        await renderAndOpen()

        const store = TestBed.inject(MockStore)
        const loadFileService = TestBed.inject(LoadFileService)
        const loadInitialFileService = TestBed.inject(LoadInitialFileService)

        const dispatchSpy = jest.spyOn(store, "dispatch")
        const spyDeleteCcState = jest.spyOn(indexedDBWriter, "deleteCcState")
        const resetMetricsSpy = jest.spyOn(resetChosenMetricsEffect, "setDefaultMetrics")

        await userEvent.click(screen.getByText("Yes"))

        expect(resetMetricsSpy).toHaveBeenCalled()
        expect(spyDeleteCcState).toHaveBeenCalled()
        expect(dispatchSpy).toHaveBeenCalledWith(setState({ value: defaultState }))
        expect(loadFileService.loadFiles).toHaveBeenCalledWith([sampleFile1, sampleFile2])
        expect(loadInitialFileService.setRenderStateFromUrl).not.toHaveBeenCalled()
    })

    it("Should reset state to maps in file query parameter when confirm is selected and file query parameter is specified", async () => {
        await renderAndOpen()

        const store = TestBed.inject(MockStore)
        const loadFileService = TestBed.inject(LoadFileService)
        const loadInitialFileService = TestBed.inject(LoadInitialFileService)
        const mockedNameDataPairs = [getNameDataPair(TEST_DELTA_MAP_A)]

        const dispatchSpy = jest.spyOn(store, "dispatch")
        const spyDeleteCcState = jest.spyOn(indexedDBWriter, "deleteCcState")
        const resetMetricsSpy = jest.spyOn(resetChosenMetricsEffect, "setDefaultMetrics")
        jest.spyOn(loadInitialFileService, "checkFileQueryParameterPresent").mockImplementation(() => true)
        jest.mocked(UrlExtractor.prototype.getFileDataFromQueryParam).mockImplementation(
            async () => new Promise(resolve => resolve(mockedNameDataPairs))
        )

        await userEvent.click(screen.getByText("Yes"))

        expect(resetMetricsSpy).toHaveBeenCalled()
        expect(spyDeleteCcState).toHaveBeenCalled()
        expect(dispatchSpy).toHaveBeenCalledWith(setState({ value: defaultState }))
        expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
        expect(loadInitialFileService.setRenderStateFromUrl).toHaveBeenCalled()
    })

    it("Should close dialog when abort is selected", async () => {
        await renderAndOpen()

        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        const resetMetricsSpy = jest.spyOn(resetChosenMetricsEffect, "setDefaultMetrics")
        await userEvent.click(screen.getByText("No"))

        expect(dispatchSpy).not.toHaveBeenCalled()
        expect(resetMetricsSpy).not.toHaveBeenCalled()
    })
})
