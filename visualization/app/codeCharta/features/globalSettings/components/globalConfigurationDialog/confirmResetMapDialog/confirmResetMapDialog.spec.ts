import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import "fake-indexeddb/auto"
import * as resetChosenMetricsEffect from "../../../../../features/metricsBar/effects/resetChosenMetrics/setDefaultMetrics"
import { CcStatePersistence, LoadFilesUseCase } from "../../../../../load/load.facade"
import { METRIC_DATA } from "../../../../../mocks/dataMocks"
import { nodeMetricDataSelector } from "../../../../../renderer/renderModel/nodeMetricData/nodeMetricData.selector"
import { setState } from "../../../../../stores/rootStore/state.actions"
import { defaultState } from "../../../../../stores/rootStore/state.manager"
import { ConfirmResetMapDialogComponent } from "./confirmResetMapDialog.component"

jest.mock("../../../../../features/metricsBar/effects/resetChosenMetrics/setDefaultMetrics")

describe("ConfirmResetMapDialogComponent", () => {
    let mockedCcStatePersistence: { read: jest.Mock; delete: jest.Mock }
    let mockedLoadFilesUseCase: { reloadAfterReset: jest.Mock }

    beforeEach(() => {
        mockedCcStatePersistence = { read: jest.fn(), delete: jest.fn().mockResolvedValue(undefined) }
        mockedLoadFilesUseCase = { reloadAfterReset: jest.fn().mockResolvedValue(undefined) }

        TestBed.configureTestingModule({
            imports: [ConfirmResetMapDialogComponent],
            providers: [
                { provide: State, useValue: { getValue: () => defaultState } },
                { provide: CcStatePersistence, useValue: mockedCcStatePersistence },
                { provide: LoadFilesUseCase, useValue: mockedLoadFilesUseCase },
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

    it("should delete the persisted state, reset the map and reload the files when confirm is selected", async () => {
        // Arrange
        await renderAndOpen()
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        await userEvent.click(screen.getByText("Yes"))

        // Assert
        expect(mockedCcStatePersistence.delete).toHaveBeenCalled()
        expect(dispatchSpy).toHaveBeenCalledWith(setState({ value: defaultState }))
        expect(mockedLoadFilesUseCase.reloadAfterReset).toHaveBeenCalled()
    })

    it("should not set the default metrics itself, because the reconciliation derives them from the reloaded files", async () => {
        // Arrange
        await renderAndOpen()
        const setDefaultMetricsSpy = jest.spyOn(resetChosenMetricsEffect, "setDefaultMetrics")

        // Act
        await userEvent.click(screen.getByText("Yes"))

        // Assert
        expect(setDefaultMetricsSpy).not.toHaveBeenCalled()
    })

    it("should close dialog when abort is selected", async () => {
        // Arrange
        const { fixture } = await renderAndOpen()
        const closeSpy = jest.spyOn(fixture.componentInstance, "close")

        // Act
        await userEvent.click(screen.getByText("No"))

        // Assert
        expect(closeSpy).toHaveBeenCalled()
        expect(mockedLoadFilesUseCase.reloadAfterReset).not.toHaveBeenCalled()
    })
})
