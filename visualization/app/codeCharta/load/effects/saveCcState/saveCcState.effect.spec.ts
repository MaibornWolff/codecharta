import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action, State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { waitFor } from "@testing-library/angular"
import { Subject } from "rxjs"
import { SortingOption } from "../../../model/domain.model"
import {
    setDomainStateDrawOutOfBound,
    setDomainStateShrinkToFit,
    setDomainStateSortingOrder,
    setDomainStateSortingOrderAscending,
    setDomainStateTopN
} from "../../../stores/domainState/domainState.write.facade"
import { setFiles } from "../../../stores/fileStore/store/files.actions"
import { setShowIncomingEdges } from "../../../stores/mapState/mapState.write.facade"
import { writeCcState } from "../../../stores/rootStore/indexedDB/indexedDBWriter"
import { removeBlacklistItems, setMarkedPackages } from "../../../stores/sharedView/sharedView.write.facade"
import { SaveCcStateEffect } from "./saveCcState.effect"

jest.mock("../../../stores/rootStore/indexedDB/indexedDBWriter", () => {
    return {
        __esModule: true,
        writeCcState: jest.fn()
    }
})

describe("SaveCcStateEffect", () => {
    // The snapshot the effect reads carries the merged word bank; what it writes must not, because the
    // reconciliation rebuilds that bank from the files on every load.
    const state = { domainLensSource: { words: { "/root": [{ text: "invoice", frequency: 10 }] } } }
    const persistedState = { domainLensSource: { words: {} } }
    let actions$: Subject<Action>

    beforeEach(async () => {
        actions$ = new Subject()
        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([SaveCcStateEffect])],
            providers: [{ provide: State, useValue: { getValue: () => state } }, provideMockStore(), provideMockActions(() => actions$)]
        })
    })

    afterEach(() => {
        actions$.complete()
        // Clear the module-level writeCcState mock so each test's call count is independent (the
        // debounce test asserts an exact count and must not see saves triggered by earlier tests).
        ;(writeCcState as jest.Mock).mockClear()
    })

    it("should save cc-state on actions requiring saving cc-state", async () => {
        const store = TestBed.inject(MockStore)
        actions$.next(setFiles({ value: [] }))
        store.refreshState()
        await waitFor(() => expect(writeCcState).toHaveBeenCalledTimes(1))
        await waitFor(() => expect(writeCcState).toHaveBeenCalledWith(persistedState))
    })

    it("should save cc-state on setShowIncomingEdges (previously missing from the save-trigger union)", async () => {
        const store = TestBed.inject(MockStore)
        actions$.next(setShowIncomingEdges({ value: true }))
        store.refreshState()
        await waitFor(() => expect(writeCcState).toHaveBeenCalledWith(persistedState))
    })

    it("should save cc-state on removeBlacklistItems (previously missing from the save-trigger union)", async () => {
        const store = TestBed.inject(MockStore)
        actions$.next(removeBlacklistItems({ items: [] }))
        store.refreshState()
        await waitFor(() => expect(writeCcState).toHaveBeenCalledWith(persistedState))
    })

    it("should save cc-state on domain-bar settings actions", async () => {
        // Arrange
        const store = TestBed.inject(MockStore)

        // Act
        actions$.next(setDomainStateTopN({ value: 42 }))
        store.refreshState()

        // Assert
        await waitFor(() => expect(writeCcState).toHaveBeenCalledWith(persistedState))
    })

    it("should save cc-state on setDomainStateDrawOutOfBound (previously missing from the save-trigger union)", async () => {
        // Arrange
        const store = TestBed.inject(MockStore)

        // Act
        actions$.next(setDomainStateDrawOutOfBound({ value: true }))
        store.refreshState()

        // Assert
        await waitFor(() => expect(writeCcState).toHaveBeenCalledWith(persistedState))
    })

    it("should save cc-state on setDomainStateShrinkToFit (previously missing from the save-trigger union)", async () => {
        // Arrange
        const store = TestBed.inject(MockStore)

        // Act
        actions$.next(setDomainStateShrinkToFit({ value: false }))
        store.refreshState()

        // Assert
        await waitFor(() => expect(writeCcState).toHaveBeenCalledWith(persistedState))
    })

    it("should save cc-state on setDomainStateSortingOrder (previously missing from the save-trigger union)", async () => {
        // Arrange
        const store = TestBed.inject(MockStore)

        // Act
        actions$.next(setDomainStateSortingOrder({ value: SortingOption.NAME }))
        store.refreshState()

        // Assert
        await waitFor(() => expect(writeCcState).toHaveBeenCalledWith(persistedState))
    })

    it("should save cc-state on setDomainStateSortingOrderAscending (previously missing from the save-trigger union)", async () => {
        // Arrange
        const store = TestBed.inject(MockStore)

        // Act
        actions$.next(setDomainStateSortingOrderAscending({ value: true }))
        store.refreshState()

        // Assert
        await waitFor(() => expect(writeCcState).toHaveBeenCalledWith(persistedState))
    })

    it("should not write the derived word bank, which a save would otherwise copy on the main thread", async () => {
        // Arrange
        const store = TestBed.inject(MockStore)

        // Act
        actions$.next(setDomainStateTopN({ value: 42 }))
        store.refreshState()

        // Assert
        await waitFor(() => expect(writeCcState).toHaveBeenCalledTimes(1))
        const [written] = (writeCcState as jest.Mock).mock.calls[0]
        expect(written.domainLensSource.words).toEqual({})
    })

    it("should debounce save cc-state on multiple actions requiring saving cc-state", async () => {
        const store = TestBed.inject(MockStore)
        actions$.next(setFiles({ value: [] }))
        actions$.next(setMarkedPackages({ value: [] }))
        store.refreshState()
        await waitFor(() => expect(writeCcState).toHaveBeenCalledTimes(1))
        await waitFor(() => expect(writeCcState).toHaveBeenCalledWith(persistedState))
    })
})
