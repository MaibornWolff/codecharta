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
import { writeCcFiles, writeCcState } from "../../../stores/rootStore/indexedDB/indexedDBWriter"
import { setState } from "../../../stores/rootStore/state.actions"
import { removeBlacklistItems, setMarkedPackages } from "../../../stores/sharedView/sharedView.write.facade"
import { isPendingSave$ } from "../../../util/busy/isPendingSave"
import { SaveCcStateEffect } from "./saveCcState.effect"

// Both resolve: the effect chains off the write to report when the save is no longer pending.
jest.mock("../../../stores/rootStore/indexedDB/indexedDBWriter", () => {
    return {
        __esModule: true,
        writeCcState: jest.fn(() => Promise.resolve()),
        writeCcFiles: jest.fn(() => Promise.resolve())
    }
})

describe("SaveCcStateEffect", () => {
    // What the record leaves out — the files, the derived word bank — is the writer's business; the
    // effect hands it the whole snapshot.
    const state = { domainLensSource: { words: { "/root": [{ text: "invoice", frequency: 10 }] } }, files: [] }
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
        ;(writeCcFiles as jest.Mock).mockClear()
    })

    it("should write the loaded files when a file action changed them", async () => {
        // Arrange
        const store = TestBed.inject(MockStore)

        // Act
        actions$.next(setFiles({ value: [] }))
        store.refreshState()

        // Assert
        await waitFor(() => expect(writeCcFiles).toHaveBeenCalledWith(state.files))
    })

    it("should not write the loaded files when only a setting changed", async () => {
        // Arrange — the files are the largest thing the session holds; a setting must not re-write them
        const store = TestBed.inject(MockStore)

        // Act
        actions$.next(setShowIncomingEdges({ value: true }))
        store.refreshState()

        // Assert
        await waitFor(() => expect(writeCcState).toHaveBeenCalled())
        expect(writeCcFiles).not.toHaveBeenCalled()
    })

    it("should write the loaded files when a map reset replaced the whole state", async () => {
        // Arrange — a reset dispatches the default state, files included, through setState
        const store = TestBed.inject(MockStore)

        // Act
        actions$.next(setState({ value: {} }))
        store.refreshState()

        // Assert
        await waitFor(() => expect(writeCcFiles).toHaveBeenCalledWith(state.files))
    })

    it("should save cc-state on actions requiring saving cc-state", async () => {
        const store = TestBed.inject(MockStore)
        actions$.next(setFiles({ value: [] }))
        store.refreshState()
        await waitFor(() => expect(writeCcState).toHaveBeenCalledTimes(1))
        await waitFor(() => expect(writeCcState).toHaveBeenCalledWith(state))
    })

    it("should save cc-state on setShowIncomingEdges (previously missing from the save-trigger union)", async () => {
        const store = TestBed.inject(MockStore)
        actions$.next(setShowIncomingEdges({ value: true }))
        store.refreshState()
        await waitFor(() => expect(writeCcState).toHaveBeenCalledWith(state))
    })

    it("should save cc-state on removeBlacklistItems (previously missing from the save-trigger union)", async () => {
        const store = TestBed.inject(MockStore)
        actions$.next(removeBlacklistItems({ items: [] }))
        store.refreshState()
        await waitFor(() => expect(writeCcState).toHaveBeenCalledWith(state))
    })

    it("should save cc-state on domain-bar settings actions", async () => {
        // Arrange
        const store = TestBed.inject(MockStore)

        // Act
        actions$.next(setDomainStateTopN({ value: 42 }))
        store.refreshState()

        // Assert
        await waitFor(() => expect(writeCcState).toHaveBeenCalledWith(state))
    })

    it("should save cc-state on setDomainStateDrawOutOfBound (previously missing from the save-trigger union)", async () => {
        // Arrange
        const store = TestBed.inject(MockStore)

        // Act
        actions$.next(setDomainStateDrawOutOfBound({ value: true }))
        store.refreshState()

        // Assert
        await waitFor(() => expect(writeCcState).toHaveBeenCalledWith(state))
    })

    it("should save cc-state on setDomainStateShrinkToFit (previously missing from the save-trigger union)", async () => {
        // Arrange
        const store = TestBed.inject(MockStore)

        // Act
        actions$.next(setDomainStateShrinkToFit({ value: false }))
        store.refreshState()

        // Assert
        await waitFor(() => expect(writeCcState).toHaveBeenCalledWith(state))
    })

    it("should save cc-state on setDomainStateSortingOrder (previously missing from the save-trigger union)", async () => {
        // Arrange
        const store = TestBed.inject(MockStore)

        // Act
        actions$.next(setDomainStateSortingOrder({ value: SortingOption.NAME }))
        store.refreshState()

        // Assert
        await waitFor(() => expect(writeCcState).toHaveBeenCalledWith(state))
    })

    it("should save cc-state on setDomainStateSortingOrderAscending (previously missing from the save-trigger union)", async () => {
        // Arrange
        const store = TestBed.inject(MockStore)

        // Act
        actions$.next(setDomainStateSortingOrderAscending({ value: true }))
        store.refreshState()

        // Assert
        await waitFor(() => expect(writeCcState).toHaveBeenCalledWith(state))
    })

    it("should report a failed save and stop waiting for it", async () => {
        // Arrange - nobody awaits the write, so a rejected one would otherwise pass silently and leave
        // the session marked as still saving
        const store = TestBed.inject(MockStore)
        const failure = new Error("the quota is exhausted")
        ;(writeCcState as jest.Mock).mockRejectedValueOnce(failure)
        const reportedErrors = jest.spyOn(console, "error").mockImplementation(() => undefined)
        let isPending = true
        const pendingSaves = isPendingSave$.subscribe(value => {
            isPending = value
        })

        // Act
        actions$.next(setShowIncomingEdges({ value: true }))
        store.refreshState()

        // Assert
        await waitFor(() => expect(reportedErrors).toHaveBeenCalledWith("Failed to persist the session:", failure))
        await waitFor(() => expect(isPending).toBe(false))
        pendingSaves.unsubscribe()
        reportedErrors.mockRestore()
    })

    it("should debounce save cc-state on multiple actions requiring saving cc-state", async () => {
        const store = TestBed.inject(MockStore)
        actions$.next(setFiles({ value: [] }))
        actions$.next(setMarkedPackages({ value: [] }))
        store.refreshState()
        await waitFor(() => expect(writeCcState).toHaveBeenCalledTimes(1))
        await waitFor(() => expect(writeCcState).toHaveBeenCalledWith(state))
    })
})
