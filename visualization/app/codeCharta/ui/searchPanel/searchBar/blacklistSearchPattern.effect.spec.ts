import { TestBed } from "@angular/core/testing"
import { MatDialog } from "@angular/material/dialog"
import { first, Subject } from "rxjs"
import { AddBlacklistItemsIfNotResultsInEmptyMapEffect } from "../../../state/effects/addBlacklistItemsIfNotResultsInEmptyMap/addBlacklistItemsIfNotResultsInEmptyMap.effect"
import { blacklistSearchPattern, BlacklistSearchPatternEffect } from "./blacklistSearchPattern.effect"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { searchPatternSelector } from "../../../state/store/dynamicSettings/searchPattern/searchPattern.selector"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action } from "@ngrx/store"
import { addBlacklistItemsIfNotResultsInEmptyMap } from "../../../state/store/fileSettings/blacklist/blacklist.actions"
import { setSearchPattern } from "../../../state/store/dynamicSettings/searchPattern/searchPattern.actions"

describe("BlacklistSearchPatternEffect", () => {
    let effect: BlacklistSearchPatternEffect
    let actions$: Subject<Action>
    let doBlacklistItemsResultInEmptyMap$: Subject<{ resultsInEmptyMap: boolean }>
    let store: MockStore

    beforeEach(() => {
        actions$ = new Subject()
        doBlacklistItemsResultInEmptyMap$ = new Subject()

        TestBed.configureTestingModule({
            providers: [
                BlacklistSearchPatternEffect,
                { provide: MatDialog, useValue: { open: jest.fn() } },
                { provide: AddBlacklistItemsIfNotResultsInEmptyMapEffect, useValue: { doBlacklistItemsResultInEmptyMap$ } },
                provideMockStore({ selectors: [{ selector: searchPatternSelector, value: "" }] }),
                provideMockActions(() => actions$)
            ]
        })
        effect = TestBed.inject(BlacklistSearchPatternEffect)
        store = TestBed.inject(MockStore)
    })

    afterEach(() => {
        actions$.complete()
        doBlacklistItemsResultInEmptyMap$.complete()
    })

    it("should exclude pattern and reset search pattern", () => {
        store.overrideSelector(searchPatternSelector, "needle")
        store.refreshState()
        const dispatchSpy = jest.spyOn(store, "dispatch")

        let firedEffect
        effect.excludeSearchPattern$.pipe(first()).subscribe(event => {
            firedEffect = event
        })
        actions$.next(blacklistSearchPattern("exclude"))
        expect(firedEffect).toEqual(addBlacklistItemsIfNotResultsInEmptyMap({ items: [{ type: "exclude", path: "*needle*" }] }))

        doBlacklistItemsResultInEmptyMap$.next({ resultsInEmptyMap: false })
        expect(dispatchSpy).toHaveBeenCalledWith(setSearchPattern({ value: "" }))
    })

    it("should not reset search pattern, when excluding from search bar failed / would result in an empty map", () => {
        store.overrideSelector(searchPatternSelector, "root")
        store.refreshState()
        const dispatchSpy = jest.spyOn(store, "dispatch")

        actions$.next(blacklistSearchPattern("exclude"))
        doBlacklistItemsResultInEmptyMap$.next({ resultsInEmptyMap: true })
        expect(dispatchSpy).not.toHaveBeenCalled()
    })
})
