import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action, State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { waitFor } from "@testing-library/angular"
import { Subject } from "rxjs"
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
    const state = {}
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

    it("should debounce save cc-state on multiple actions requiring saving cc-state", async () => {
        const store = TestBed.inject(MockStore)
        actions$.next(setFiles({ value: [] }))
        actions$.next(setMarkedPackages({ value: [] }))
        store.refreshState()
        await waitFor(() => expect(writeCcState).toHaveBeenCalledTimes(1))
        await waitFor(() => expect(writeCcState).toHaveBeenCalledWith(state))
    })
})
