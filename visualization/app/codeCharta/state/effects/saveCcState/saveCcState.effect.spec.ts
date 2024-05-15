import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { Action, State } from "@ngrx/store"
import { Subject } from "rxjs"
import { SaveCcStateEffect } from "./saveCcState.effect"
import { provideMockActions } from "@ngrx/effects/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { setFiles } from "../../store/files/files.actions"
import { writeCcState } from "../../../util/indexedDB/indexedDBWriter"
import { waitFor } from "@testing-library/angular"
import { setMarkedPackages } from "../../store/fileSettings/markedPackages/markedPackages.actions"
import { setEdges } from "../../store/fileSettings/edges/edges.actions"

jest.mock("../../../../../app/codeCharta/util/indexedDB/indexedDBWriter", () => {
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
    })

    it("should save cc-state on actions requiring saving cc-state", async () => {
        const store = TestBed.inject(MockStore)
        actions$.next(setFiles({ value: [] }))
        store.refreshState()
        await waitFor(() => expect(writeCcState).toHaveBeenCalledTimes(1))
        await waitFor(() => expect(writeCcState).toHaveBeenCalledWith(state))
    })

    it("should debounce save cc-state on multiple actions requiring saving cc-state", async () => {
        const store = TestBed.inject(MockStore)
        actions$.next(setEdges({ value: [] }))
        actions$.next(setFiles({ value: [] }))
        actions$.next(setMarkedPackages({ value: [] }))
        store.refreshState()
        await waitFor(() => expect(writeCcState).toHaveBeenCalledTimes(1))
        await waitFor(() => expect(writeCcState).toHaveBeenCalledWith(state))
    })
})
