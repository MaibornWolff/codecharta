import { TestBed } from "@angular/core/testing"
import { MatDialog } from "@angular/material/dialog"
import { BehaviorSubject } from "rxjs"

import { AddBlacklistItemsIfNotResultsInEmptyMapEffect } from "./addBlacklistItemsIfNotResultsInEmptyMap.effect"
import { EffectsModule } from "@ngrx/effects"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action } from "@ngrx/store"
import { getLastAction } from "../../../util/testUtils/store.utils"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { blacklistSelector } from "../../store/fileSettings/blacklist/blacklist.selector"
import { addBlacklistItems, addBlacklistItemsIfNotResultsInEmptyMap } from "../../store/fileSettings/blacklist/blacklist.actions"
import { FILE_STATES_JAVA } from "../../../util/dataMocks"

describe("AddBlacklistItemsIfNotResultsInEmptyMapEffect", () => {
    const mockedDialog = { open: jest.fn() }
    let actions$: BehaviorSubject<Action>
    let store: MockStore

    beforeEach(() => {
        actions$ = new BehaviorSubject({ type: "" })
        mockedDialog.open = jest.fn()

        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([AddBlacklistItemsIfNotResultsInEmptyMapEffect])],
            providers: [
                { provide: MatDialog, useValue: mockedDialog },
                provideMockStore({
                    selectors: [
                        {
                            selector: visibleFileStatesSelector,
                            value: []
                        },
                        {
                            selector: blacklistSelector,
                            value: []
                        }
                    ]
                }),
                provideMockActions(() => actions$)
            ]
        })
        store = TestBed.inject(MockStore)
    })

    afterEach(() => {
        actions$.complete()
    })

    it("should ignore a not relevant action", async () => {
        actions$.next({ type: "whatever" })
        expect(await getLastAction(store)).toEqual({ type: "@ngrx/effects/init" })
        expect(mockedDialog.open).not.toHaveBeenCalled()
    })

    it("should not blacklist items if it would lead to an empty map but show error dialog", () => {
        actions$.next(addBlacklistItemsIfNotResultsInEmptyMap({ items: [{ type: "exclude", path: "foo/bar" }] }))
        store.refreshState()
        expect(mockedDialog.open).toHaveBeenCalledTimes(1)
    })

    it("should blacklist items if it doesn't lead to an empty map", async () => {
        store.overrideSelector(visibleFileStatesSelector, FILE_STATES_JAVA)
        store.refreshState()
        actions$.next(addBlacklistItemsIfNotResultsInEmptyMap({ items: [{ type: "exclude", path: "/root/src/main/file1.java" }] }))

        expect(await getLastAction(store)).toEqual(addBlacklistItems({ items: [{ type: "exclude", path: "/root/src/main/file1.java" }] }))
        expect(mockedDialog.open).not.toHaveBeenCalled()
    })
})
