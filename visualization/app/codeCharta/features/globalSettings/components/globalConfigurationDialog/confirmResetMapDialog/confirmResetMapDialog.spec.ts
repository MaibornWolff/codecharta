import { HttpClient } from "@angular/common/http"
import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import "fake-indexeddb/auto"
import { getNameDataPair } from "../../../../../stores/fileStore/fileStore.facade"
import { LoadFileService } from "../../../../../stores/fileStore/fileStore.facade"
import { sampleFile1, sampleFile2 } from "../../../../../stores/fileStore/fileStore.facade"
import { LoadInitialFileService } from "../../../../../load/load.facade"
import { UrlExtractor } from "../../../../../stores/fileStore/fileStore.facade"
import * as resetChosenMetricsEffect from "../../../../../features/metricsBar/effects/resetChosenMetrics/setDefaultMetrics"
import { nodeMetricDataSelector } from "../../../../../renderer/renderModel/nodeMetricData/nodeMetricData.selector"
import { setState } from "../../../../../stores/rootStore/state.actions"
import { defaultState } from "../../../../../stores/rootStore/state.manager"
import { METRIC_DATA, TEST_DELTA_MAP_A } from "../../../../../mocks/dataMocks"
import * as indexedDBWriter from "../../../../../stores/rootStore/indexedDB/indexedDBWriter"
import { ConfirmResetMapDialogComponent } from "./confirmResetMapDialog.component"

jest.mock("../../../../../stores/rootStore/indexedDB/indexedDBWriter")
jest.mock("../../../../../stores/fileStore/fileStore.facade")
jest.mock("../../../../../features/metricsBar/effects/resetChosenMetrics/setDefaultMetrics")

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
                            selector: nodeMetricDataSelector,
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
